import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import pool from '../../DB/connect.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from './Utils/sendEmail.js';

dotenv.config();

const register = async (req, res) => {

    try {

        const { firstName, lastName, country, role, phoneNumber, eMail, password } = req.body;

        // Check if the e-mail already exists
        const [rows] = await pool.query('SELECT 1 FROM Users WHERE eMail = ?', [eMail]);
        if (rows.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'E-mail already exists' });
        }

        // Hash the password and generate a user_id
        const hashedPassword = await bcrypt.hash(password, 10);
        const user_id = uuidv4();
    
        // Insert the user into the database
        // User's remaining fields are set to their default values by MYSQL (e.g., isVerified = 0 , profile_picture = predefined default image , subscription_type = Basic)
        const sql = 'INSERT INTO Users (user_id, firstName, lastName, country, role, phoneNumber, eMail, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await pool.query(sql, [user_id, firstName, lastName, country, role, phoneNumber, eMail, hashedPassword]);

        // Create a token
        const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '2m' });

        // Send confirmation email
        await sendEmail(eMail, token, 'confirmation');

        res.status(StatusCodes.CREATED).json({ message: 'User created successfully please verify your account via the link sent by Email' });
    
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email' });
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid password' });
        }

        if (user.isVerified === 'FALSE') {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Please verify your email' });
        }

        // Set last login and remove deletion request if exists
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('UPDATE Users SET last_login = ?, deletion_requested_at = ? WHERE user_id = ?', [date, null, user.user_id]);

        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        return res.status(StatusCodes.OK).json({
            token,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export { register, login };

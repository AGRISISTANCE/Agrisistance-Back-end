import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import pool from '../../DB/connect.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from './Utils/sendEmail.js';
import randomNumbers from './Utils/randomNumbers.js'

import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_API_KEY;
const client = twilio(accountSid, authToken);


const register = async (req, res) => {

    try {

        const { firstName, lastName, country, role, eMail, password } = req.body;

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
        const sql = 'INSERT INTO Users (user_id, firstName, lastName, country, role, eMail, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await pool.query(sql, [user_id, firstName, lastName, country, role, eMail, hashedPassword]);

        // Create a token
        const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '2m' });

        // Send confirmation email
        await sendEmail(eMail, token, 'confirmation');
        
        // update history
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Create Account', date]);

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
        const user_id = user.user_id

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
        await pool.query('UPDATE Users SET last_login = ?, deletion_requested_at = ? WHERE user_id = ?', [date, null, user_id]);
        
        // Update History
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Log in Account', date]);
        
        // Send JWT if no 2FA
        if (user.is_2fa_enabled === 'FALSE'){

            const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });
            return res.status(StatusCodes.OK).json({
                msg : "Logged in successfully !",
                token,
            })
        }


        // Generate OTP in case is_2fa_enabled === 'TRUE'
        const randomNumber = Math.floor(Math.random() * 10000);
        randomNumbers[user_id] = randomNumber;

        // Send the SMS Text : This part is commented as it consume credits from my twilio account (it works fine)
        
        // await client.messages.create({
        //     body: `Dear User,

        //             Your A2SV-Agrisistance verification code is ${randomNumber}. Please enter this code in the app/website to verify your account.

        //             Thank you.`,

        //     from: '+19387772642',

        //       to: user.phoneNumber
        // }).then(message => console.log(message.sid));


        // Send it via email instead
        await sendEmail(user.eMail, randomNumber, 'OTPverify');
        
        console.log(`Generated number for : ${randomNumber}`);

        const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        return res.status(StatusCodes.OK).json({
            msg : "number generated",
            token,
        });



    } catch (error) {
        console.error('Error during login:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};


const verifyOTP = async (req, res) => {

    const user_id = req.user.id;

    const number = req.body.number;
    const correctNumber = randomNumbers[user_id];

    if (typeof correctNumber === 'undefined') {
        return res.status(StatusCodes.BAD_GATEWAY).send('No number generated for this ID');
    }

    // Verify OTP
    if (number === correctNumber) {
        const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        return res.status(StatusCodes.OK).json({
            msg : "correct number",
            token,
        });

    } else {
        res.send('Incorrect number');
    }

    
};

export { register, login, verifyOTP };
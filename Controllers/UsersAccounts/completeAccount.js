import { StatusCodes } from 'http-status-codes';
import pool from '../../DB/connect.js';
import jwt from 'jsonwebtoken';

const completeAccount = async (req, res) => {
    
    const user_id = req.params.user_id;
    const { firstName, lastName, country, role } = req.body;


    await pool.query('UPDATE Users SET firstName = ?, lastName = ?, country = ?, role = ? WHERE user_id = ?', [firstName, lastName, country, role, user_id]);

    // Create a token, in most cases people who connect with Google are already verified so no need to send verification email to them
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        
    // update history
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Create Account', date]);

    res.status(StatusCodes.CREATED).json({ 
        message: 'User created successfully',
        token 

    });

};

export default completeAccount;
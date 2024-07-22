import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import pool from '../../DB/connect.js';

const editProfile = async (req, res) => {
    
    user_id = req.user.id;
    const { firstName, lastName, country, role } = req.body;

    try {
        
        const sql = 'UPDATE Users SET firstName = ?, lastName = ?, country = ?, role = ? WHERE user_id = ?';
        await pool.query(sql, [firstName, lastName, country, role, user_id]);

        return res.status(StatusCodes.OK).json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error during profile update:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export default editProfile;
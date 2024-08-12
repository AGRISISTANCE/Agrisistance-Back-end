import pool from '../../DB/connect.js';
import { StatusCodes } from 'http-status-codes';

const getProfile = async (req, res) => {
    const user_id = req.user.id;

    try {
        const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [user_id]);
        const user = rows[0];

        return res.status(StatusCodes.OK).json(user);
    }
    catch (error) {
        console.error('Error during profile retrieval:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export default getProfile;

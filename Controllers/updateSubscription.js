import { StatusCodes } from 'http-status-codes';
import pool from '../DB/connect.js';

const UpdateSubscription = async (req, res) => {

    // TODO : payment logic here

    const { subscription_type } = req.body;
    const user_id = req.user.id;

    const sql = `UPDATE Users SET subscription_type = ? WHERE user_id = ?`;

    try {
        await pool.query(sql, [subscription_type, user_id]);
        res.status(StatusCodes.OK).json({ message: 'Subscription updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export default UpdateSubscription;

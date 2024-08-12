import pool from '../../DB/connect.js';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

const resetPasswor = async (req, res) => {
    const user_id = req.params.user_id;
    const { newPassword } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedPassword, user_id]);

        return res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Error during password update:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};


const updatePassword = async (req, res) => {
    const user_id = req.user.id;
    const { oldPassword, newPassword } = req.body;

    try {
        const [rows] = await pool.query('SELECT password FROM Users WHERE user_id = ?', [user_id]);
        const user = rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedPassword, user_id]);

        return res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error during password update:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

export { resetPasswor, updatePassword };
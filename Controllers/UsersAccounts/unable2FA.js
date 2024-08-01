import { StatusCodes } from "http-status-codes";
import pool from "../../DB/connect.js";

const unable2FA = async (req, res) => {

    const user_id = req.user.id;
    const { phoneNumber } = req.body;

    try{
        await pool.query('UPDATE users SET phoneNumber = ? , is_2fa_enabled = ? WHERE id = ?', [phoneNumber,'TRUE', user_id]);
        return res.status(StatusCodes.OK).json({ message: '2FA enabled successfully' });
    }catch (error) {
        console.error('Error during 2FA enable:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
     
};

export default unable2FA;
import pool from '../../DB/connect.js'
import { StatusCodes } from 'http-status-codes';
import sendEmail from './Utils/sendEmail.js';

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



const editProfile = async (req, res) => {
    
    user_id = req.user.id;
    const { firstName, lastName, country, role } = req.body;

    try {
        
        const sql = 'UPDATE Users SET firstName = ?, lastName = ?, country = ?, role = ? WHERE user_id = ?';
        await pool.query(sql, [firstName, lastName, country, role, user_id]);

        // Update history
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Edit Account', date]);
    

        return res.status(StatusCodes.OK).json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error during profile update:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

const deleteProfile = async (req, res) => {

    const user_id = req.user.id;

    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);

    try{
        // Update deletion request time
        await pool.query('UPDATE Users SET deletion_requested_at = ? WHERE user_id = ?', [date , user_id]);
        
        // Send email to the user
        const [email] = await pool.query('SELECT eMail FROM Users WHERE user_id = ?' , [user_id]);
        
        await sendEmail(email[0].eMail , '', 'deletion');    

        // Update History
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Request Account Deletion', date]);
        
        res.status(StatusCodes.ACCEPTED).json({ message: 'Account deletion request recieved successfully please check you E-mail' });


    }catch(e){
        console.log('Error : ', e)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }

};

export { getProfile, editProfile, deleteProfile };
import pool from '../../DB/connect.js'
import { StatusCodes } from 'http-status-codes';
import sendEmail from './Utils/sendEmail.js';


const deleteAccount = async (req, res) => {

    const user_id = req.user.id;

    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);

    try{
        // Update deletion request time
        await pool.query('UPDATE Users SET deletion_requested_at = ? WHERE user_id = ?', [date , user_id]);
        
        // Send email to the user
        const [email] = await pool.query('SELECT eMail FROM Users WHERE user_id = ?' , [user_id]);
        
        await sendEmail(email[0].eMail , '', 'deletion');    

        res.status(StatusCodes.ACCEPTED).json({ message: 'Account deletion request recieved successfully please check you E-mail' });


    }catch(e){
        console.log('Error : ', e)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }

    //get the id from auth middleware
    //send mail
    //start counter 3 days
    //when counter ends delete all data associated to account , then the account
    //or change their id and not show them to other users because we could use them for training models
    //delete account
    // send email that the account has been deleted
    //if the person connected to the account before the timer ends stop the timer

};

export default deleteAccount;
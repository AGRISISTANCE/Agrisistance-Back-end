import dotenv from 'dotenv';
import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {pool} from '../../DB/connect.js';
import sendEmail from './Utils/sendEmail.js';
import { StatusCodes } from 'http-status-codes';
import randomNumbers from './Utils/randomNumbers.js'


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
        const sql = 'INSERT INTO Users (user_id, firstName, lastName, country, role, eMail, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await pool.query(sql, [user_id, firstName, lastName, country, role, eMail, hashedPassword]);

        // Create a token
        const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '2m' });

        // Send confirmation email
        await sendEmail(eMail, token, 'confirmation');
        
        // update history
        const actions_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[actions_id, user_id, 'Create Account', date]);

        // Send response
        res.status(StatusCodes.CREATED).json({ message: 'User created successfully please verify your account via the link sent by Email' });
    
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};


/***************************************************************************************************************************************************** */


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email' });
        }

        const user_id = user.user_id

        // Check if the password is correct
        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid password' });
        }

        // Check if the email is verified
        if (user.isVerified === 'FALSE') {
            
            // Send confirmation email again
            const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '2m' });
            await sendEmail(user.eMail, token, 'confirmation');
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Please verify your email' });
        }

        // Set last login and remove deletion request if exists
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('UPDATE Users SET last_login = ?, deletion_requested_at = ? WHERE user_id = ?', [date, null, user_id]);
        
        // Update History
        const action_id = uuidv4();
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Log in Account', date]);
        
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


/***************************************************************************************************************************************************** */


const verifyUserEmail = async (req, res) => {
    try {
        const token = req.params.token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user_id = payload.user_id;
        
        // Update the user's email verification status
        await pool.query('UPDATE Users SET isVerified = ? WHERE user_id = ?', [ 'TRUE', user_id ]);

        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Verify E-mail', date]);
    
        // Send the token
        const realToken = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        return res.status(StatusCodes.ACCEPTED).json({ token : realToken}); // TODO : Should be a redirection to the home page here 

    } catch (e) {
  
      if (e.name === 'TokenExpiredError') {

        // Serve an HTML page for expired token
        return res.status(StatusCodes.UNAUTHORIZED).sendFile(path.join(__dirname, '../../Views/TokenExpired.html'));
        
      }

      console.error('Error verifying email:', e);
      res.status(400).send('Error verifying email'); 
    }

};


/***************************************************************************************************************************************************** */


const verifyOTP = async (req, res) => {

    const user_id = req.user.id;

    const {otp} = req.body;
    const correctNumber = randomNumbers[user_id];

    // Check if the number was generated
    if (typeof correctNumber === 'undefined') {
        return res.status(StatusCodes.BAD_GATEWAY).send('No number generated for this ID');
    }

    // Verify OTP
    if (otp === correctNumber) {
        const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        return res.status(StatusCodes.OK).json({
            msg : "correct number",
            token,
        });

    } else {
        res.send('Incorrect number');
    }

    
};


/***************************************************************************************************************************************************** */


const forgotPassword = async (req, res) => {
    
        try {
            const { eMail } = req.body;
    
            // Check if the user exists
            const [rows] = await pool.query('SELECT * FROM Users WHERE eMail = ?', [eMail]);
            const user = rows[0];
            const user_id = user.user_id;
    
            if (!user) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid email' });
            }
    
            // Create a token and send the email
            const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '2m' });
            await sendEmail(eMail, user_id, 'resetPassword');
    
            // Send response
            return res.status(StatusCodes.OK).json({ message: 'Reset password link sent to your email' });
    
        } catch (error) {
            console.error('Error during forgot password:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
        }
};


/***************************************************************************************************************************************************** */


const resetPassword = async (req, res) => {
    const user_id = req.params.user_id;
    const { newPassword } = req.body;

    try {
        // Hash the new password and update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedPassword, user_id]);

        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Reset Password', date]);

        return res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Error during password update:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};




export { register, login, verifyUserEmail, verifyOTP, forgotPassword, resetPassword };
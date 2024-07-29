import jwt from 'jsonwebtoken';
import pool from '../../DB/connect.js';
import { StatusCodes } from 'http-status-codes';

const verifyUserEmail = async (req, res) => {
    try {
      const token = req.params.token
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      const user_id = payload.user_id;

      await pool.query('UPDATE Users SET isVerified = ? WHERE user_id = ?', [ 'TRUE', user_id ]);

        // Update history
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Verify E-mail', date]);
    

      const realToken = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });
      return res.status(StatusCodes.ACCEPTED).json({ token : realToken}); // TODO : Should be a redirection to the home page here 

    } catch (e) {
      console.error('Error verifying email:', e);
      res.status(400).send('Error verifying email'); 
    }

};

export default verifyUserEmail;
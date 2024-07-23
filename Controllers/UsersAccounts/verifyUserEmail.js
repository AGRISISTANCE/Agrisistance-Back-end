import jwt from 'jsonwebtoken';
import pool from '../../DB/connect.js';
import { StatusCodes } from 'http-status-codes';

const verifyUserEmail = async (req, res) => {
    try {
      const token = req.params.token
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      const userId = payload.user_id;

      await pool.query('UPDATE Users SET isVerified = ? WHERE user_id = ?', [ 'TRUE', userId ]);

      const realToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10d' });
      return res.status(StatusCodes.ACCEPTED).json({ token : realToken}); // TODO : Should be a redirection to the home page here 

    } catch (e) {
      console.error('Error verifying email:', e);
      res.status(400).send('Error verifying email'); 
    }

};

export default verifyUserEmail;
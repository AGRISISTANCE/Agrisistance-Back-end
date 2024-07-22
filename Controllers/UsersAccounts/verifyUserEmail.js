import jwt from 'jsonwebtoken';
import pool from '../../DB/connect.js';

const verifyUserEmail = async (req, res) => {
    try {
      const token = req.params.token
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      await pool.query('UPDATE Users SET isVerified = 1 WHERE user_id = ?', [payload.user_id]);
    } catch (e) {
      //console.error('Error verifying email:', e);
      res.status(400).send('Error verifying email');
    }
  
    return res.status(200).send('Email verified');

};

export default verifyUserEmail;
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import dotenv from 'dotenv';

import pool from '../DB/connect.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../Controllers/UsersAccounts/Utils/sendEmail.js';
import randomNumbers from '../Controllers/UsersAccounts/Utils/randomNumbers.js';

import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_API_KEY;
const client = twilio(accountSid, authToken);



const router = express.Router();

// Google OAuth2.0
let userProfile;
passport.use(
   new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.MY_REDIRECT_URI,
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
            
        }
    )
);



/******************************************* Helper Functions *********************************************************** */

async function login (req, res, user_id) {

    const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [user_id]);
    const user = rows[0];

    // Set last login and remove deletion request if exists
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('UPDATE Users SET last_login = ?, deletion_requested_at = ? WHERE user_id = ?', [date, null, user_id]);
    
    // Update History
    await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Log in Account', date]);
    
    // Send JWT, in most cases people who connect with Google are already verified so no need for 2FA 
    const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });

    return res.status(StatusCodes.OK).json({
        msg : "Logged in successfully !",
        token,
    });
    
}


/******************************************* Routes to authenticate user with Google *********************************************************** */

// Route to authenticate user with Google
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));


// Callback route after Google has authenticated the user
router.get('/callback', passport.authenticate('google', { failureRedirect: '/api/auth/google/error' }), 
    (req, res) => {
        res.redirect('/api/auth/google/success-auth');
    }
);


// Success logging in via Google
router.get('/success-auth', async (req, res) => {
    
    try {
        
        const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [userProfile.id]);
        
        if (rows.length === 0) {

            // Insert new user into DB
            await pool.query('INSERT INTO Users (user_id, firstName, lastName, eMail, profile_picture, isVerified) VALUES (?, ?, ?, ?, ?, ?)', 
                [userProfile.id, userProfile.name.givenName, userProfile.name.familyName, userProfile.emails[0].value, userProfile.photos[0].value], 'TRUE');

            return res.redirect(`/api/user/complete-account/${userProfile.id}`);

        } else {
    
            console.log('Google user already exists in DB.');
            return login(req, res, userProfile.id);
    
        }
    
    } catch (error) {
    
        console.error('Error during database operation:', error);
    
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error during database operation.' });
    
    }
    
});


// Error logging in via Google
router.get('/error', (req, res) => res.send('Error logging in via Google.'));



export default router;
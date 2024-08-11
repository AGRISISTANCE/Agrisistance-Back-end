import { StatusCodes } from 'http-status-codes';

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

import pool from '../../DB/connect.js';
import jwt from 'jsonwebtoken';

import path from 'path';
import { fileURLToPath } from 'url';

import twilio from 'twilio';

import dotenv from 'dotenv';

/*************************************************** Configurations *************************************************** */

dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_API_KEY;
const client = twilio(accountSid, authToken);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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


/******************************************* Functions to authenticate user with Google *********************************************************** */

// Route to authenticate user with Google
const passportScope = passport.authenticate('google', { scope: ['profile', 'email'] });


// Redirect to error page if authentication fails
const passportFailureRedirect = passport.authenticate('google', { failureRedirect: '/api/auth/google/error' }); 


// Callback route after Google has authenticated the user
const callback = (req, res) => {
    res.redirect('/api/auth/google/Terms-auth');
};


// Route to accept terms
const termsAuth =  async (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Accept-terms.html'));
};


// Success logging in via Google
const successAuth = async (req, res) => {
    
    try {
        
        const [rows] = await pool.query('SELECT 1 FROM Users WHERE user_id = ?', [userProfile.id]);
        
        if (rows.length === 0) {

            // Insert new user into DB
            await pool.query('INSERT INTO Users (user_id, firstName, lastName, eMail, profile_picture, isVerified) VALUES (?, ?, ?, ?, ?, ?)', 
                [userProfile.id, userProfile.name.givenName, userProfile.name.familyName, userProfile.emails[0].value, userProfile.photos[0].value, 'TRUE']);

            return res.redirect(`/api/user/complete-account/${userProfile.id}`);

        }


        return login(req, res, userProfile.id);
    
    
    } catch (error) {
    
        console.error('Error during database operation:', error);
    
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error during database operation.' });
    
    }
    
};


// Error logging in via Google
const Error = (req, res) => res.status(StatusCodes.BAD_REQUEST).json({  message :'Error logging in via Google.' });


export {callback, termsAuth, successAuth, Error, passportScope, passportFailureRedirect};
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

import pool from '../DB/connect.js';

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

/******************************************* Route to authenticate user with Google *********************************************************** */
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
            await pool.query('INSERT INTO Users (user_id, firstName, lastName, eMail, profile_picture) VALUES (?, ?, ?, ?, ?)', 
                [userProfile.id, userProfile.name.givenName, userProfile.name.familyName, userProfile.emails[0].value, userProfile.photos[0].value]);

            console.log('Google user inserted into DB.');
            // TODO : send a token , send email and redirect to add role and country before continuing
        } else {
    
            console.log('Google user already exists in DB.');
            // TODO : send a token to the user
    
        }
    
        res.status(StatusCodes.OK).json({ message: 'Google user authenticated.' });
    
    } catch (error) {
    
        console.error('Error during database operation:', error);
    
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error during database operation.' });
    
    }
    
});


// Error logging in via Google
router.get('/error', (req, res) => res.send('Error logging in via Google.'));



export default router;
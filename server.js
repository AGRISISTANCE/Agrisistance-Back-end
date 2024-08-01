import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import session from 'express-session';

import 'express-async-errors';
import pool from './DB/connect.js'

import notFoundMiddleware from './Middleware/not-found.js';
import errorHandlerMiddleware from './Middleware/error-handler.js';

import routes from './Routes/index.js';
import './Util/scheduler.js';


const app = express();

// Session
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
}));
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser(async (id, done) => {
  done (null, id);
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({limit : '100mb'}));
app.use(express.urlencoded({limit : '100mb', extended : true }));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

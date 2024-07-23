import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });



const sendConfirmationEmail = async (email, token) => {
  try {

    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });




    const emailTemplatePath = path.join(__dirname, 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
    const emailHtml = emailTemplate.replace('verification_link', `http://localhost:8081/api/user/register/verify/${token}`);


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Confirmation',
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};

export default sendConfirmationEmail;



// Second way to implement the same functionality 

// import SMTPClient from 'emailjs';

// const sendConfirmationEmail = async (email, token) => {

//   try {
//     const client = new SMTPClient.SMTPClient({
//       user: process.env.EMAIL_USER,
//       password: process.env.EMAIL_PASSWORD,
//       host: 'smtp.gmail.com',
//       ssl: true,
//     });

//     const message = await client.sendAsync ({
//       text: `Click the following link to verify your email: http://localhost:8081/api/user/register/verify/${token}`,
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Email Confirmation',
//       attachment: [
//          { data: '<html>i <i>hope</i> this works!</html>', alternative: true },
//          { path: 'path/to/file.zip', type: 'application/zip', name: 'renamed.zip' },
//       ],
//     });

//     console.log(message);

//   } catch (error) {
//     console.error('Error sending confirmation email:', error);
//     throw new Error('Failed to send confirmation email');
//   }

// };

// export default sendConfirmationEmail;




import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// E-mail type
const emailTemplates = {
  confirmation: 'confirmationEmail.html',
  deletion: 'deletionEmail.html',
  successdeletion: 'successDeletionEmail.html',
  OTPverify : 'OTPverifyEmail.html'
};

const emailObjects = {
  confirmation: 'Email Confirmation',
  deletion: 'Account Deletion Request',
  successdeletion: 'Account Deleted',
  OTPverify : '2FA One-Time Password'
}


// Load environment variables
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });


const sendEmail = async (email, token, type) => {
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


    
    const emailTemplateFile = emailTemplates[type];
    const emailObject = emailObjects[type];

    // Adjust the path to the email template
    const emailTemplatePath = path.join(__dirname, '../Emails', emailTemplateFile);
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
    var emailHtml = emailTemplate;
    
    // Edit E-mails by injection variables
    if (type === 'confirmation'){
      emailHtml = emailTemplate.replace('verification_link', `http://localhost:8081/api/user/register/verify/${token}`);
    }else if (type === 'OTPverify'){
      emailHtml = emailTemplate.replace('{{otp}}', token);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailObject,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};

export default sendEmail;




// Second way to implement the same functionality 

// import SMTPClient from 'emailjs';

// const sendEmail = async (email, token) => {

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

// export default sendEmail;




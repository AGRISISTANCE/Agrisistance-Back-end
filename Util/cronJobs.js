import pool from '../DB/connect.js';
import sendEmail from '../Controllers/UsersAccounts/Utils/sendEmail.js';


const deleteUserAccountsCronJob = async () => {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  
      // Select users whose deletion was requested more than 3 days ago
      const [users] = await pool.query('SELECT user_id, email FROM Users WHERE deletion_requested_at IS NOT NULL AND deletion_requested_at <= ?', [threeDaysAgo]);
  
      for (const user of users) {
        // Check if user has logged in during the 3-day period
        const [result] = await pool.query('SELECT last_login FROM Users WHERE user_id = ?', [user.user_id]);
        if (result[0].last_login && result[0].last_login > threeDaysAgo) {
          console.log(`Deletion aborted for user ${user.user_id} due to recent login`);
          continue;
        }
  
        // Delete the user account and his data
        await pool.query('DELETE FROM history WHERE user_id = ?', [user.user_id]);
        await pool.query('DELETE FROM financial_data WHERE user_id = ?', [user.user_id]);
        await pool.query('DELETE FROM yield_predictions WHERE user_id = ?', [user.user_id]);
       
        await pool.query('DELETE FROM crop_types WHERE user_id = ?', [user.user_id]);
        await pool.query('DELETE FROM pest_data WHERE user_id = ?', [user.user_id]);

        await pool.query('DELETE FROM recommendations WHERE user_id = ?', [user.user_id]);

        await pool.query('DELETE FROM weather_data WHERE user_id = ?', [user.user_id]);

        await pool.query('DELETE FROM soil_data WHERE user_id = ?', [user.user_id]);
        await pool.query('DELETE FROM users WHERE user_id = ?', [user.user_id]);

        // TODO : migrate this data into a new database for Data (create new database for deleted accounts -pool_deleted-)
  
        // Send deletion confirmation email
        await sendEmail(user.email, '', 'successdeletion');
      }
    } catch (error) {
      console.error('Error during account deletion cron job:', error);
    }
};
  
  export default deleteUserAccountsCronJob;

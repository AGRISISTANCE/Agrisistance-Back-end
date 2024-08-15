import { StatusCodes } from 'http-status-codes';
import pool from '../DB/connect.js';

import fetch from 'node-fetch';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { extractPublicId, deleteImageFromCloudinary } from './UsersAccounts/Utils/cloudinaryDelete.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


/****************************************************************************************************************************************************** */

const addLand = async (req, res) => {

    const { latitude, longitude, land_size, land_name, land_image, ph_level, phosphorus, potassium, oxygen_level, nitrogen } = req.body;
    const user_id = req.user.id;

    var land_img = null;

    // Upload image to cloudinary
    if (land_image) {
      const uploadResult = await cloudinary.uploader.upload(land_image, { folder: 'Agrisistance/Land-Pictures' });
      land_img = uploadResult.secure_url;
    }
    
    

    // Get humidity from API
    const options = {
      method: 'GET',
      headers: {
          accept: 'application/json'
      }
    };

    const locationURL = `https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&units=metric&apikey=${process.env.TOMMOROW_API_KEY}`; 
    const response = await fetch (locationURL , options);
    const data = await response.json();

    const humidity = data.data.values.humidity;


    // Insert land data into database
    const sql = `INSERT INTO Land_Data (latitude, longitude, land_size, land_name, land_image, ph_level, phosphorus, potassium, oxygen_level, nitrogen, humidity, user_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {

      await pool.query(sql, [latitude, longitude, land_size, land_name, land_img, ph_level, phosphorus, potassium, oxygen_level, nitrogen, humidity, user_id]);
     
        // Update history
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Add Land', date]);

      res.status(StatusCodes.CREATED).json({ message: 'Land added successfully' });

    } catch (error) {

      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

    }

};

/****************************************************************************************************************************************************** */


const updateLand = async (req, res) => {

  const { latitude, longitude, land_size, land_name, land_image, ph_level, phosphorus, potassium, oxygen_level, nitrogen } = req.body;
  const { land_id } = req.params;
  const user_id = req.user.id;

  var land_img = null;

  // check if there is an image to update
  if (land_image) {
    const [result] = await pool.query('SELECT land_image FROM land_data WHERE land_id = ?', [land_id]);

    if (result[0].land_image) {
        const publicId = extractPublicId(userRows[0].profile_picture);
        if (publicId) {
            await deleteImageFromCloudinary(publicId, 'Land-Pictures');
        }
    }
    
    const uploadResult = await cloudinary.uploader.upload(land_image, { folder: 'Agrisistance/Land-Pictures' });
    land_img = uploadResult.secure_url;
  }

  const sql = `UPDATE Land_Data SET latitude = ?, longitude = ?, land_size = ?, land_name = ?, land_image = ?, ph_level = ?, phosphorus = ?, potassium = ?, oxygen_level = ?, nitrogen = ?
               WHERE land_id = ? AND user_id = ?`;

  try {

    await pool.query(sql, [latitude, longitude, land_size, land_name, land_img, ph_level, phosphorus, potassium, oxygen_level, nitrogen, land_id, user_id]);

    // Update history
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Update Land', date]);

    res.status(StatusCodes.OK).json({ message: 'Land updated successfully' });
  
  } catch (error) {

    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

  }

};


/****************************************************************************************************************************************************** */


const getLandbyID = async (req, res) => {

  const { land_id } = req.params;
  const user_id = req.user.id;

  try {

    const [result] = await pool.query('SELECT * FROM Land_Data WHERE land_id = ? AND user_id = ?', [land_id, user_id]);
    res.status(StatusCodes.OK).json(result);

  } catch (error) {

    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

  }

};


/****************************************************************************************************************************************************** */


const getAllLands = async (req, res) => {

  const user_id = req.user.id;

  try{

    const [result] = await pool.query('SELECT * FROM Land_Data WHERE user_id = ?', [user_id])
    res.status(StatusCodes.OK).json(result);

  } catch (error) {

    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

  }
};


/****************************************************************************************************************************************************** */


// make hierarichal deletion and maybe not delete it but migrate it to another database

const deleteLand = async (req, res) => {

  const { land_id } = req.params;
  const user_id = req.user.id;

  try {

    // Check if there is an image to delete
    const [result] = await pool.query('SELECT land_image FROM land_data WHERE land_id = ?', [land_id]);
    if (result[0].land_image) {
      const publicId = extractPublicId(userRows[0].profile_picture);
      if (publicId) {
          await deleteImageFromCloudinary(publicId, 'Land-Pictures');
      }
    }

    // Delete land
    await pool.query(`DELETE FROM Land_Data WHERE land_id = ? AND user_id = ?`, [land_id, user_id]);

    // Update history
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Delete Land', date]);

    res.status(StatusCodes.OK).json({ message: 'Land deleted successfully' });

  } catch (error) {

    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

  }

};

export { addLand, updateLand, getLandbyID, getAllLands, deleteLand };

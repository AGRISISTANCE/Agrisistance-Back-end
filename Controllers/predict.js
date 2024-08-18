import axios from 'axios';
import {pool} from '../DB/connect.js';
import { v4 as uuidv4 } from 'uuid';

const predict = async (req, res) => {
  try {

    // Get the land_id from the request body
    const { land_id } = req.body;
    const user_id = req.user.id;

    //################################################################################################################

    // Fetch the soil data and weather data from the database
    const [land_result] = await pool.query('SELECT ph_level, nitrogen, phosphorus, potassium FROM land_data WHERE land_id = ? AND user_id = ?', [land_id, user_id]);
    const land_data = land_result[0];

    const [weather_result] = await pool.query('SELECT temperature, humidity, rainfall FROM weather_data WHERE land_id = ?', [land_id]);
    const weather_data = weather_result[0];
    console.log(land_data);
    console.log(weather_data);
   
    // Send the soil data and weather data to the FastAPI server
    const model_inputs = [land_data.ph_level, weather_data.temperature, weather_data.rainfall, weather_data.humidity, land_data.nitrogen, land_data.phosphorus, land_data.potassium];
    console.log(model_inputs);
  
    //################################################################################################################

    // Send the model inputs to the FastAPI server
    const response = await axios.post('http://localhost:8082/predict', {input: model_inputs});

    console.log(response.data);


    // // Insert the recommendations into the database
    // const [rec_result] = await pool.query(`INSERT INTO Recommendations (user_id, land_id, weather_id) VALUES (?, ?, ?)`,[user_id, land_id, weather_data.weather_id]);
  
    // // Insert the predicted crop types into the database
    // const cropValues = Object.values(response.data)[0]; 
    // for (const value of cropValues) {
    //   await pool.query(`INSERT INTO crop_types (crop_type, rec_id) VALUES (?, ?)`, [value[0], rec_result.insertId]);
    // }


           
    // Update history
    const action_id = uuidv4();
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Generate Business Plan', date]);

    // Return the response from the FastAPI server
    res.json(response.data);

  } catch (error) {
    console.error('Error communicating with FastAPI server', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default predict;

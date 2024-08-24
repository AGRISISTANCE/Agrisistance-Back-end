import axios from 'axios';
import fetch from 'node-fetch';
import {pool} from '../DB/connect.js';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

const generateBusinessPlan = async (req, res) => {
  try {

    // Get the land_id from the request body
    const { land_id } = req.body;
    const user_id = req.user.id;


    // Fetch the soil data and weather data from the database
    const [land_result] = await pool.query('SELECT land_size, ph_level, phosphorus, potassium, oxygen_level, nitrogen FROM land_data WHERE land_id = ? AND user_id = ?', [land_id, user_id]);
    const land_data = land_result[0];

    const [weather_result] = await pool.query('SELECT temperature, humidity, rainfall FROM weather_data WHERE land_id = ?', [land_id]);
    const weather_data = weather_result[0];

    const [financial_result] = await pool.query('SELECT investment_amount FROM Financial_Data WHERE user_id = ?', [user_id]);
    const financial_data = financial_result[0];


   
    // Prepare the model inputs
    const model_inputs = [land_data.ph_level, weather_data.temperature, weather_data.rainfall, weather_data.humidity,
      land_data.nitrogen, land_data.phosphorus, land_data.potassium, land_data.oxygen_level, financial_data.investment_amount,
      land_data.land_size];

    // Send the model inputs to the FastAPI server
    const response = await axios.post('http://localhost:8082/generate-business-plan', {input: model_inputs});


    // TODO : Insert the recommendations into the database


      
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



const chatBot = async (req, res) => {
  const { message } = req.body;
  const user_id = req.user.id;

  try {

    const response = await fetch('http://localhost:8082/chat', {  // Adjust the URL if needed
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: message }],
          max_token: 100,
          temperature: 0.7,
          response_format: 'text/plain',
          user_id: 'agricultural_chatbot'  
      })
      
    });

    const data = await response.json();

    const result = data.response.messages[0].content

    res.status(StatusCodes.OK).json({ result });

  }catch (error) {
    console.error('Error communicating with FastAPI server', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export { generateBusinessPlan, chatBot };

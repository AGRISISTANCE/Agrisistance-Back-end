import axios from 'axios';
import pool from '../DB/connect.js';

const predict = async (req, res) => {
  try {

    const [soil_result] = await pool.query('SELECT soil_id, ph_level, nitrogen, phosphorus, potassium FROM soil_data WHERE user_id = ?', [req.user.id]);
    const soil_data = soil_result[0];

    const [weather_result] = await pool.query('SELECT temperature, humidity, rainfall FROM weather_data WHERE soil_id = ?', [soil_data.soil_id]);
    const weather_data = weather_result[0];

    
   
    const model_inputs = [soil_data.ph_level, weather_data.temperature, weather_data.rainfall, weather_data.humidity, soil_data.nitrogen, soil_data.phosphorus, soil_data.potassium];
  
    const response = await axios.post('http://localhost:8082/predict', {input: model_inputs});
    res.json(response.data);

  } catch (error) {
    console.error('Error communicating with FastAPI server', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default predict;

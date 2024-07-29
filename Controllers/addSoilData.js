import { StatusCodes } from 'http-status-codes';
import pool from '../DB/connect.js';


const addSoilData = async (req, res) => {

    const { latitude, longitude, land_size, ph_level, nitrogen, phosphorus, potassium, porosity, oxygen_level } = req.body;
    const user_id = req.user.id;

    const sql = `INSERT INTO Soil_Data (latitude, longitude, land_size, ph_level, nitrogen, phosphorus, potassium, porosity, oxygen_level, user_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {

      await pool.query(sql, [latitude, longitude, land_size, ph_level, nitrogen, phosphorus, potassium, porosity, oxygen_level, user_id]);
     
        // Update history
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Add Soil Data', date]);

      res.status(StatusCodes.CREATED).json({ message: 'Soil data added successfully' });

    } catch (error) {

      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });

    }

};

export default addSoilData;

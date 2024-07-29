import pool from '../DB/connect.js';
import { StatusCodes } from 'http-status-codes';

const AddPestData = async (req, res) => {
    const { species, infestation_level, soil_id } = req.body;
    const user_id = req.user.id;

    try {
        
        const sql = `INSERT INTO Pest_Data (species, infestation_level, soil_id) VALUES (?, ?, ?)`;
        await pool.query(sql, [species, infestation_level, soil_id]);
       
        // Update history
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history (user_id, action_details, date_time) VALUES (?, ?, ?)',[user_id, 'Add Pest Data', date]);

        res.status(StatusCodes.CREATED).json({ message: 'Pest data added successfully' });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export default AddPestData;

import fetch from 'node-fetch'; 
import {pool} from '../DB/connect.js'; 
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const getWeatherData = async (req , res) => {
    try {
        

        let { City , land_id, lat, lon } = req.body;

        // Fetch weather data from the API
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        };

        const locationURL = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&units=metric&apikey=${process.env.TOMMOROW_API_KEY}`; 

        //City = City.replace(' ', '%20');
        // const cityURL`https://api.tomorrow.io/v4/weather/realtime?location=${City}&units=metric&apikey=${process.env.TOMMOROW_API_KEY}`;

        const response = await fetch (locationURL , options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching weather data');
        }

        console.log(data);

        // Extract weather conditions
        const { temperature, humidity, precipitationProbability, uvIndex } = data.data.values;

        // Update the Weather_Data table with the fetched weather data
        
        const weather_id = uuidv4();
        await pool.query(`INSERT INTO Weather_Data VALUES (?, ?, ?, ?, ?, ?)`, [weather_id, temperature, humidity, precipitationProbability, uvIndex, land_id]);

        // Return the weather data
        return res.json({ temperature, humidity, precipitation :precipitationProbability , sunlight : uvIndex });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

export default getWeatherData;














//OpenWeather API
/*
import pool from '../DB/connect.js';
import dotenv from 'dotenv';
import request from 'request';

dotenv.config();

// Function to map OpenWeather descriptions to our custom weather types
const mapWeatherToEnumeration = (weatherDescription) => {
    const description = weatherDescription.toLowerCase();

    if (description.includes('snow')) return 'Neigeux';
    if (description.includes('clear')) return 'Ensoleillé';
    if (description.includes('wind')) return 'Venteux';
    if (description.includes('rain') || description.includes('drizzle') || description.includes('thunderstorm')) return 'Pluvieux';
    if (description.includes('cloud')) return 'Nuageux';
    
    return 'Unknown';  // default case if no match
};

const getWeather = async (req, res) => {
    try {
        const barageId = req.body.barageId;
        const [barageRows] = await pool.query('SELECT City FROM barage_table WHERE barage_id = ?', [barageId]);

        if (barageRows.length === 0) {
            return res.status(404).json({ error: 'Barage not found' });
        }

        const City = barageRows[0].City;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${City},DZ&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;

        request(url, (err, response, body) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const weather = JSON.parse(body);
            if (weather.main === undefined) {
                return res.status(404).json({ error: 'City not found or API error' });
            } else {
                const weatherDescription = weather.weather[0].main;
                const weatherEnum = mapWeatherToEnumeration(weatherDescription);

                return res.status(200).json({ 
                    weather: weather, 
                    customWeatherDescription: `The weather in ${weather.name} is currently ${weatherEnum}.`
                });
            }
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default getWeather;
*/

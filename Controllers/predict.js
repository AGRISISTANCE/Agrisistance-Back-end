import axios from 'axios';

const predict = async (req, res) => {
  try {
    const response = await axios.post('http://localhost:8082/predict', {input: [8, 71, 100, 70, 10, 50, 150]});
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with FastAPI server', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default predict;

import dotenv from 'dotenv';
import express from 'express';
import connectDB from './dbconnection/mongo.js';
import { importMainDatasetFromCSV } from './utils/importMainDataset.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// importMainDatasetFromCSV();


app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
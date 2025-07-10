import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import MainDataset from '../modals/MainDataset.js';

export async function importMainDatasetFromCSV() {
  const results = {};
  const filePath = path.resolve('../ML_Models/main_dataset.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const key = `${data.product_name}|${data.region}|${data.product_category}`;
        if (!results[key]) {
          results[key] = {
            product_name: data.product_name,
            region: data.region,
            product_category: data.product_category,
            sales_history: [],
          };
        }
        results[key].sales_history.push({
          date: new Date(data.date),
          units_sold: Number(data.units_sold),
          day_of_week: data.day_of_week,
        });
      })
      .on('end', async () => {
        try {
          // Remove all previous data (optional, comment out if not desired)
          await MainDataset.deleteMany({});
          const docs = Object.values(results);
          const inserted = await MainDataset.insertMany(docs);
          resolve({ message: 'Data imported successfully', count: inserted.length });
        } catch (err) {
          reject({ error: 'Error saving to database', details: err.message });
        }
      })
      .on('error', (err) => {
        reject({ error: 'Error reading CSV file', details: err.message });
      });
  });
} 
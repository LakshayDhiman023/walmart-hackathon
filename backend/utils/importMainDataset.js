import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import MainDataset from '../modals/MainDataset.js';

export async function importMainDatasetFromCSV() {
  const results = [];
  const filePath = path.resolve('../ML_Models/main_dataset.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          date: new Date(data.date),
          product_name: data.product_name,
          units_sold: Number(data.units_sold),
          day_of_week: data.day_of_week,
          region: data.region,
          product_category: data.product_category,
        });
      })
      .on('end', async () => {
        try {
          const inserted = await MainDataset.insertMany(results);
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
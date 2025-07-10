import express from 'express';
import MainDataset from '../modals/MainDataset.js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const router = express.Router();

// Helper: Calculate EMA percentage change
function calculateEMAChange(sales_history, alpha = 0.3) {
  if (!sales_history || sales_history.length < 2) return { trend: 'Unknown', percent: 0 };
  const sorted = [...sales_history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const n = sorted.length;
  const half = Math.floor(n / 2);
  const firstHalf = sorted.slice(0, half);
  const lastHalf = sorted.slice(half);
  const ema = (data) => {
    let v = data[0].units_sold;
    for (let i = 1; i < data.length; i++) {
      v = alpha * data[i].units_sold + (1 - alpha) * v;
    }
    return v;
  };
  const emaFirst = ema(firstHalf);
  const emaLast = ema(lastHalf);
  let trend = 'stable';
  if (emaLast > emaFirst * 1.05) trend = 'increasing';
  else if (emaLast < emaFirst * 0.95) trend = 'decreasing';
  const percent = ((emaLast - emaFirst) / (emaFirst || 1)) * 100;
  return { trend, percent };
}

// Helper: Read model predictions from CSV
function readModelTrends() {
  return new Promise((resolve, reject) => {
    const filePath = path.resolve('../ML_Models/demand_trends_summary.csv');
    const results = {};
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Use prophet_trend and prophet_forecast for now
        results[row.product] = {
          model_trend: row.prophet_trend.toLowerCase(),
          model_percent: Number(row.prophet_forecast),
        };
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// GET /api/products - return all products with consensus trend and percent
router.get('/', async (req, res) => {
  try {
    const [products, modelTrends] = await Promise.all([
      MainDataset.find({}),
      readModelTrends(),
    ]);
    const merged = await Promise.all(products.map(async (product) => {
      // Assign random stock if missing
      if (typeof product.current_stock !== 'number') {
        product.current_stock = Math.floor(Math.random() * 181) + 20; // 20-200
        await product.save();
      }
      // Calculate stock_run_out
      let stock_run_out = 'N/A';
      if (product.current_stock > 0 && product.sales_history && product.sales_history.length > 0) {
        const sorted = [...product.sales_history].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last7 = sorted.slice(0, 7);
        const avg = last7.reduce((sum, s) => sum + s.units_sold, 0) / last7.length;
        if (avg > 0) stock_run_out = Math.round(product.current_stock / avg);
      }
      const model = modelTrends[product.product_name] || {};
      const ema = calculateEMAChange(product.sales_history);
      // Consensus: if both agree, use that; if not, use the one with higher percent change
      let consensusTrend = ema.trend;
      let consensusPercent = ema.percent;
      if (model.model_trend && model.model_trend !== 'stable') {
        if (ema.trend === model.model_trend) {
          consensusTrend = ema.trend;
          consensusPercent = (ema.percent + model.model_percent) / 2;
        } else {
          // Use the one with higher absolute percent change
          if (Math.abs(model.model_percent) > Math.abs(ema.percent)) {
            consensusTrend = model.model_trend;
            consensusPercent = model.model_percent;
          }
        }
      }
      return {
        ...product.toObject(),
        consensus_trend: consensusTrend,
        consensus_percent: consensusPercent,
        ema_trend: ema.trend,
        ema_percent: ema.percent,
        model_trend: model.model_trend,
        model_percent: model.model_percent,
        stock_run_out,
      };
    }));
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// POST /api/products/:id/increment-stock - increment stock by 10
router.post('/:id/increment-stock', async (req, res) => {
  try {
    const product = await MainDataset.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (typeof product.current_stock !== 'number') product.current_stock = 0;
    product.current_stock += 10;
    await product.save();
    res.json({ message: 'Stock incremented', current_stock: product.current_stock });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment stock', details: err.message });
  }
});

export default router; 
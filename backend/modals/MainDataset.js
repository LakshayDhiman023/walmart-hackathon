import mongoose from 'mongoose';

const SalesHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  units_sold: { type: Number, required: true },
  day_of_week: { type: String, required: true },
}, { _id: false });

const MainDatasetSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  region: { type: String, required: true },
  product_category: { type: String, required: true },
  sales_history: { type: [SalesHistorySchema], required: true },
  current_stock: { type: Number }, // can be undefined, assign random if missing
});

const MainDataset = mongoose.model('MainDataset', MainDatasetSchema);
export default MainDataset; 
import mongoose from 'mongoose';

const MainDatasetSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  product_name: { type: String, required: true },
  units_sold: { type: Number, required: true },
  day_of_week: { type: String, required: true },
  region: { type: String, required: true },
  product_category: { type: String, required: true },
});

const MainDataset = mongoose.model('MainDataset', MainDatasetSchema);
export default MainDataset; 
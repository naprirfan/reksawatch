const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define our model
const priceSchema = new Schema({
  date: { type: Date, unique: true },
  price: Number,
  ema30: Number,
  sma60: Number,
  sma200: Number,
  recommendation: String,
  recommendation_type: String
});

// Create the model class
const ModelClass = mongoose.model('price', priceSchema);

// Export the model
module.exports = ModelClass;

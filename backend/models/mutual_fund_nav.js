const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define our model
const dataSchema = new Schema({
  date: Date,
  name: String,
  nav: Number,
  one_day_delta: Number,
  one_month_delta: Number,
  one_year_delta: Number,
  three_years_delta: Number
});

// Create the model class
const ModelClass = mongoose.model('mutual_fund_nav', dataSchema);

// Export the model
module.exports = ModelClass;

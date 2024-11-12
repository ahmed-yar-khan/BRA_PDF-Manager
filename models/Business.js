const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  NTN: { type: String, required: true },
  businessName: { type: String },
  description: { type: String },
  principalService: { type: String },
  email: { type: String },
  enrollmentDate: { type: Date },
  filings: { type: mongoose.Schema.Types.Mixed },  // Allow dynamic keys
});

module.exports = mongoose.model("Business", businessSchema);

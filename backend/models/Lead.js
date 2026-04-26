const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide lead name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide lead email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
  },
  company: {
    type: String,
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Closed'],
    default: 'New',
  },
  value: {
    type: Number,
    default: 0,
  },
  // The CRM user who created/owns this lead
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  // The Agent this lead is assigned to
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null,
  },
  // The manager/admin who assigned this lead
  assignedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);


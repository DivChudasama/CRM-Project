const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  // Store role at time of action so we can filter without joins
  userRole: {
    type: String,
    enum: ['Admin', 'Manager', 'Agent'],
    default: 'Agent',
  },
  type: {
    type: String,
    enum: ['Lead Created', 'Lead Updated', 'Lead Deleted', 'Status Changed', 'Login'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lead: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lead',
  },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);

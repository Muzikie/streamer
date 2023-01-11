const mongoose = require('mongoose');

const User = mongoose.model('User', {
  name: {
    type: String,
    required: [true, 'User must have a name'],
  },
  description: {
    type: String,
    required: [true, 'User must have a description'],
  },
  address: {
    type: String,
    required: [true, 'User must have a valid Lisk 32 address'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = User;

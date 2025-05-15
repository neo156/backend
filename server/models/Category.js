const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  color: {
    type: String,
    default: '#3498db'
  },
  icon: {
    type: String,
    default: 'book'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('category', CategorySchema); 
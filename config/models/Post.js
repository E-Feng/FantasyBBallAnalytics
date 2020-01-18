const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  post: {
    type: String,
    required: [true, 'Please add a post'],
  },
  user: {
    type: String,
    required: [true, 'Add a username']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);
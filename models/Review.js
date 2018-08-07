const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    required: 'You must supply an author',
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  store: {
    required: 'You must supply a store',
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  text: {
    trim: true,
    required: 'Your review must have text',
    type: String
  },
  rating: {
    required: 'Your review must have rating',
    type: Number,
    min: 1,
    max: 5
  }
});

let preFindOperation = function(next) {
  // Second param if fieldSelection
  this.populate('author', 'name').sort('-created');
  next();
}

reviewSchema.pre('find', preFindOperation);
reviewSchema.pre('findOne', preFindOperation);

module.exports = mongoose.model('Review', reviewSchema);
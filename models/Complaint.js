const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
  author: {
    name: {
      type: String,
      required: 'You must supply an author'
    },
    link: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  description: {
    type: String,
    minlength: [15, 'Too small description'],
    maxlength: [150, 'Too small description']
  },
  kind: {
    required: true,
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: 'You must supply store'
  },
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }

});

module.exports = mongoose.model('Complaint', complaintSchema);
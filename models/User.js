const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');


let userSchema = new Schema({
  role: Number,
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [ validator.isEmail, 'Invalid email address' ],
    required: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    /* validate: [  
      {
        validator: (val) => {
          return validator.matches(val, new RegExp('^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$'));
        }, 
        message: 'Name is not invalid'
      }
    ], */
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: {
    stores: [
      {
        type: Schema.ObjectId,
        ref: 'Store'
      }
    ]
  }
});


userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
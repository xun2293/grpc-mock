// users模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  auth: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    required: false
  }
});

module.exports = {
  Users: mongoose.model('User', UserSchema)
};


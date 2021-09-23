// users模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MockSchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  protocol: {
    type: String,
    unique: true,
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  message: {
    type: Object,
    required: true
  },
  source: {
    type: Number,
    required: true
  },
  isEnable: {
    type: Boolean,
    required: false
  }
});

module.exports = {
  Mocks: mongoose.model('Mock', MockSchema)
};


/**
 let protocol = req.protocol;
 let packageName = req.packageName;
 let service = req.service;
 let method = req.method;
 let message = req.message;
 let source = req.source;
 */

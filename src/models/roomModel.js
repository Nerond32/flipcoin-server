const mongoose = require('mongoose');

const { Schema } = mongoose;

const roomModel = new Schema({
  hostToken: String,
  name: String,
  creationDate: Date,
  users: [{ token: String, name: String, confirmed: Boolean }],
  messages: [{ source: String, content: String }]
});

module.exports = mongoose.model('Room', roomModel);

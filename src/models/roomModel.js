const mongoose = require('mongoose');

const { Schema } = mongoose;

const roomModel = new Schema({
  name: String,
  creationDate: Date,
  users: [{ name: String, confirmed: Boolean }],
  messages: [{ source: String, content: String }]
});

module.exports = mongoose.model('Room', roomModel);

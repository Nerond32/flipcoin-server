const mongoose = require('mongoose');

const { Schema } = mongoose;

const roomModel = new Schema({
  creationDate: Date,
  roomName: String,
  host: { hostToken: String, hostName: String },
  messages: [
    { msgId: String, msgType: String, msgAuthor: String, msgContent: String }
  ],
  users: [{ userToken: String, userName: String, userConfirmed: Boolean }]
});

module.exports = mongoose.model('Room', roomModel);

const mongoose = require('mongoose');

const { Schema } = mongoose;

const roomModel = new Schema({
  roomName: String,
  host: { hostToken: String, hostId: String },
  messages: [
    {
      msgId: String,
      msgType: String,
      msgTimestamp: Date,
      msgAuthor: String,
      msgContent: String
    }
  ],
  users: [
    {
      userId: String,
      userToken: String,
      userName: String,
      userConfirmed: Boolean
    }
  ]
});

module.exports = mongoose.model('Room', roomModel);

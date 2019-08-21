const Room = require('../models/roomModel');
const generateToken = require('../utils/generateToken');
const messageTypes = require('../constants/messageTypes');

const createRoom = async (roomName, userName, userToken) => {
  const newRoom = new Room();
  const hostToken = userToken || generateToken();
  const userId = generateToken();
  newRoom.host = {
    hostToken,
    hostId: userId
  };
  newRoom.roomName = roomName;
  newRoom.users.push({
    userToken: hostToken,
    userSessionId: '',
    userId,
    userName,
    userIsConfirmed: false,
    userIsOnline: false
  });
  newRoom.messages.push({
    msgId: generateToken(),
    msgTimeStamp: Date.now(),
    msgType: messageTypes.SPECIAL,
    msgAuthor: '',
    msgContent: `Room ${roomName} has been created by ${userName}`
  });
  await newRoom.save();
  const response = { userToken: hostToken };
  return response;
};

module.exports = { createRoom };

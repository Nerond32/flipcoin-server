const generateToken = require('../utils/generateToken');
const messageTypes = require('../constants/messageTypes');

const sendMessage = (io, room, msgContent, msgAuthor) => {
  const newMessage = {
    msgId: generateToken(),
    msgType: messageTypes.MESSAGE,
    msgTimestamp: Date.now(),
    msgAuthor,
    msgContent
  };
  room.messages.push(newMessage);
  room.save();
  io.to(room.roomName).emit('new message', JSON.stringify(newMessage));
};

const userJoined = (io, room, user) => {
  const { userId, userName } = user;
  const newMessage = {
    msgId: generateToken(),
    msgType: messageTypes.USER_JOINED,
    msgTimestamp: Date.now(),
    msgAuthor: '',
    msgContent: `User ${user.userName} joined the room`
  };
  const messageToClient = {
    message: newMessage,
    user: {
      userId,
      userName
    }
  };
  room.messages.push(newMessage);
  room.save();
  io.to(room.roomName).emit('user joined', JSON.stringify(messageToClient));
};

const userLeft = (io, room, userId, userName) => {
  const newMessage = {
    msgId: generateToken(),
    msgType: messageTypes.USER_LEFT,
    msgTimestamp: Date.now(),
    msgAuthor: '',
    msgContent: `User ${userName} left the room`
  };
  room.messages.push(newMessage);
  room.save();
  const messageToClient = {
    message: newMessage,
    userId
  };
  io.to(room.roomName).emit('user left', JSON.stringify(messageToClient));
};

const userChangedConfirmStatus = (io, room, userId, userIsConfirmed) => {
  const messageToClient = {
    userId,
    userIsConfirmed
  };
  io.to(room.roomName).emit(
    'user changed confirm status',
    JSON.stringify(messageToClient)
  );
};

module.exports = {
  sendMessage,
  userJoined,
  userLeft,
  userChangedConfirmStatus
};

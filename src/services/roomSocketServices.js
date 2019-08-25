const Room = require('../models/roomModel');
const generateToken = require('../utils/generateToken');
const messageTypes = require('../constants/messageTypes');
const socketErrorHandling = require('./helpers/socketErrorHandling');

const getRoom = async (roomName, userToken, userName) => {
  const room = await Room.findOne({ roomName });
  let result =
    socketErrorHandling.handleRoomNotExists(room, roomName) ||
    socketErrorHandling.handleUserConflicts(room, userToken, userName);
  if (!result) {
    const returnedToken = userToken || generateToken();
    let userWithToken = room.users.find(user => {
      return user.userToken === userToken;
    });
    if (!userWithToken) {
      userWithToken = {
        userId: generateToken(),
        userToken: returnedToken,
        userName,
        userIsConfirmed: false,
        userIsOnline: true
      };
      room.users.push(userWithToken);
    } else {
      userWithToken.userIsOnline = true;
    }
    const usersData = room.users
      .filter(user => user.userIsOnline)
      .map(user => {
        return {
          userId: user.userId,
          userName: user.userName,
          userIsConfirmed: user.userIsConfirmed
        };
      });
    const newMessage = {
      msgId: generateToken(),
      msgType: messageTypes.USER_JOINED,
      msgTimestamp: Date.now(),
      msgAuthor: '',
      msgContent: `User ${userWithToken.userName} joined the room`
    };
    room.messages.push(newMessage);
    await room.save();
    result = {
      response: {
        room: {
          hostId: room.host.hostId,
          roomName: room.roomName,
          messages: room.messages,
          users: usersData
        },
        userToken: returnedToken,
        userName
      },
      messageToRoom: {
        message: newMessage,
        user: {
          userId: userWithToken.userId,
          userName: userWithToken.userName
        }
      }
    };
  }
  return result;
};

const sendMessage = async (roomName, userToken, message) => {
  const room = await Room.findOne({ roomName });
  let result = socketErrorHandling.handleRoomNotExists(room, roomName);
  if (!result) {
    const userWithToken = room.users.find(user => {
      return user.userToken === userToken;
    });
    if (!userWithToken) {
      result = {
        error: 'User with this token is not present in this room!',
        status: 400
      };
    } else {
      const newMessage = {
        msgId: generateToken(),
        msgType: messageTypes.MESSAGE,
        msgTimestamp: Date.now(),
        msgAuthor: userWithToken.userName,
        msgContent: message
      };
      room.messages.push(newMessage);
      await room.save();
      result = {
        messageToRoom: {
          message: newMessage
        }
      };
    }
  }
  return result;
};

const userLeft = async (roomName, userId) => {
  const room = await Room.findOne({ roomName });
  let result = socketErrorHandling.handleRoomNotExists(room, roomName);
  if (!result) {
    const userWithId = room.users.find(user => {
      return user.userId === userId;
    });
    userWithId.userIsOnline = false;
    const newMessage = {
      msgId: generateToken(),
      msgType: messageTypes.USER_LEFT,
      msgTimestamp: Date.now(),
      msgAuthor: '',
      msgContent: `User ${userWithId.userName} left the room`
    };
    room.messages.push(newMessage);
    await room.save();
    result = {
      messageToRoom: {
        message: newMessage,
        user: {
          userId: userWithId.userId,
          userName: userWithId.userName
        }
      }
    };
  }
  return result;
};

module.exports = { getRoom, sendMessage, userLeft };

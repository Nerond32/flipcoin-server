const generateToken = require('../utils/generateToken');
const messageTypes = require('../constants/messageTypes');

const handleRoomFinding = (err, room, roomName) => {
  let response = '';
  if (err) {
    response = {
      error: `Failed to get room. Reason: ${err}`,
      status: 404
    };
  } else if (!room) {
    response = {
      error: `Room ${roomName} does not exist`,
      status: 404
    };
  }
  return response;
};

const handleNotEnoughInfo = (userToken, userName) => {
  let response = '';
  if (!userToken && !userName) {
    response = {
      error: 'Cannot join room without username or remembered user token!',
      status: 400
    };
  }
  return response;
};

const handleUserConflicts = (room, userToken, userName) => {
  let response = '';
  let userWithToken;
  let userWithName;
  if (userToken) {
    userWithToken = room.users.find(user => {
      return user.userToken === userToken;
    });
  }
  if (userName) {
    userWithName = room.users.find(user => {
      return user.userName === userName;
    });
  }
  if (
    userWithName &&
    userWithToken &&
    userWithName.userToken !== userWithToken.userToken
  ) {
    response = {
      error: 'Mismatch between provided token and username!',
      status: 409
    };
  } else if (userWithName && !userWithToken) {
    response = {
      error: `User ${userName} already exists!`,
      status: 409
    };
  }
  return response;
};

const sendMessageToRoom = (io, room, message) => {
  io.to(room.roomName).emit('new message', JSON.stringify(message));
};

const socketRouter = (io, Room) => {
  io.on('connection', socket => {
    let socketRoomName;
    let socketUserName;
    socket.on('request room', msg => {
      const { roomName, userToken, userName } = JSON.parse(msg);
      Room.findOne({ roomName }, (err, room) => {
        let response =
          handleRoomFinding(err, room, roomName) ||
          handleNotEnoughInfo(userToken, userName) ||
          handleUserConflicts(room, userToken, userName);
        if (!response) {
          const returnedToken = userToken || generateToken();
          const userWithToken = room.users.find(user => {
            return user.userToken === userToken;
          });
          if (!userWithToken) {
            room.users.push({
              userId: generateToken(),
              userToken: returnedToken,
              userName,
              userConfirmed: false
            });
          }
          const usersData = room.users.map(user => {
            return {
              userId: user.userId,
              userName: user.userName,
              userConfirmed: user.userConfirmed
            };
          });
          const newMessage = {
            msgId: generateToken(),
            msgType: messageTypes.USER_JOINED,
            msgTimestamp: Date.now(),
            msgAuthor: '',
            msgContent: `User ${userName} joined the room`
          };
          sendMessageToRoom(io, room, newMessage);
          room.messages.push(newMessage);
          socketRoomName = room.roomName;
          socketUserName = userName;
          room.save();
          const responseRoom = {
            hostId: room.host.hostId,
            messages: room.messages,
            users: usersData
          };
          response = {
            room: responseRoom,
            userToken: returnedToken,
            userName
          };
        }
        socket.emit('send room', JSON.stringify(response));
        socket.join(room.roomName);
      });
    });
    socket.on('send message', msg => {
      const { roomName, userToken, message } = JSON.parse(msg);
      console.log(userToken);
      let response;
      Room.findOne({ roomName }, (err, room) => {
        console.log(room.users);
        if (err) {
          response = {
            error: `Failed to get room. Reason: ${err}`
          };
        } else if (!room) {
          response = {
            error: `Room ${roomName} does not exist`
          };
        } else {
          const userWithToken = room.users.find(user => {
            return user.userToken === userToken;
          });
          if (!userWithToken) {
            response = {
              error: 'User with this token is not present in this room!'
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
            room.save();
            sendMessageToRoom(io, room, newMessage);
          }
        }
        if (response) {
          socket.emit('new message', JSON.stringify(response));
        }
      });
    });
    socket.on('disconnect', () => {
      if (socketRoomName && socketUserName) {
        Room.findOne({ roomName: socketRoomName }, (err, room) => {
          if (!err && room) {
            const message = {
              msgId: generateToken(),
              msgType: messageTypes.USER_LEFT,
              msgTimestamp: Date.now(),
              msgAuthor: '',
              msgContent: `User ${socketUserName} left the room`
            };
            room.messages.push(message);
            room.save();
            sendMessageToRoom(io, room, message);
          }
        });
      }
    });
  });
};

module.exports = socketRouter;

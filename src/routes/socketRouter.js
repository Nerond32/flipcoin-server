const generateToken = require('../utils/generateToken');
const messageTypes = require('../constants/messageTypes');

const socketRouter = (io, Room) => {
  io.on('connection', socket => {
    let socketUserName;
    let socketRoomName;
    socket.on('request room', msg => {
      const { roomName, userToken, userName } = JSON.parse(msg);
      Room.findOne({ roomName }, (err, room) => {
        let response;
        if (err) {
          response = {
            error: `Failed to get room. Reason: ${err}`
          };
        } else if (!room) {
          response = {
            error: `Room ${roomName} does not exist`
          };
        } else if (!userToken && !userName) {
          response = {
            error: 'Cannot join room without username or remembered user token!'
          };
        } else {
          let userWithToken;
          let userWithName;
          if (userToken) {
            userWithToken = room.users.find(user => {
              return user.userToken === userToken;
            });
          }
          if (!userWithToken) {
            userWithName = room.users.find(user => {
              return user.userName === userName;
            });
          }
          if (userWithName) {
            response = {
              error: 'User with that username already exists!'
            };
          } else {
            const returnedToken = userToken || generateToken();
            socketUserName = userWithToken ? userWithToken.userName : userName;
            socketRoomName = room.roomName;
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
              msgContent: `User ${socketUserName} joined the room`
            };
            room.messages.push(newMessage);
            room.save();

            const responseRoom = {
              hostId: room.host.hostId,
              messages: room.messages,
              users: usersData
            };
            response = {
              room: responseRoom,
              userToken: returnedToken,
              userName: socketUserName
            };
          }
        }
        socket.emit('send room', JSON.stringify(response));
      });
    });
    socket.on('send message', msg => {
      const { roomName, userToken, message } = JSON.parse(msg);
      let response;
      Room.findOne({ roomName }, (err, room) => {
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
            response = { message: newMessage };
          }
        }
        socket.emit('new message', JSON.stringify(response));
      });
    });
    socket.on('disconnect', () => {
      if (socketUserName && socketRoomName) {
        Room.findOne({ roomName: socketRoomName }, (err, room) => {
          if (!err && room) {
            const newMessage = {
              msgId: generateToken(),
              msgType: messageTypes.USER_LEFT,
              msgTimestamp: Date.now(),
              msgAuthor: '',
              msgContent: `User ${socketUserName} left the room`
            };
            room.messages.push(newMessage);
            room.save();
            const response = { message: newMessage };
            socket.emit('new message', JSON.stringify(response));
          }
        });
      }
    });
  });
};

module.exports = socketRouter;

const generateToken = require('../utils/generateToken');
const socketErrorHandling = require('./socketErrorHandling');
const roomHandlers = require('./roomHandlers');

const socketRouter = (io, Room) => {
  io.on('connection', socket => {
    let socketData = {};
    socket.on('request room', msg => {
      const { roomName, userToken, userName } = JSON.parse(msg);
      Room.findOne({ roomName }, (err, room) => {
        let response =
          socketErrorHandling.handleRoomFinding(err, room, roomName) ||
          socketErrorHandling.handleNotEnoughInfo(userToken, userName) ||
          socketErrorHandling.handleUserConflicts(room, userToken, userName);
        if (!response) {
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
          roomHandlers.userJoined(io, room, userWithToken);
          socketData = {
            roomName: room.roomName,
            userId: userWithToken.userId,
            userName
          };
          const responseRoom = {
            hostId: room.host.hostId,
            roomName: room.roomName,
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
        if (room) {
          socket.join(room.roomName);
        }
      });
    });
    socket.on('send message', msg => {
      const { roomName, userToken, message } = JSON.parse(msg);
      let response;
      Room.findOne({ roomName }, (err, room) => {
        response = socketErrorHandling.handleRoomFinding(err, room, roomName);
        if (!response) {
          const userWithToken = room.users.find(user => {
            return user.userToken === userToken;
          });
          if (!userWithToken) {
            response = {
              error: 'User with this token is not present in this room!'
            };
          } else {
            roomHandlers.sendMessage(io, room, message, userWithToken.userName);
          }
        }
      });
    });
    socket.on('change confirm status', msg => {
      const { roomName, userToken, userIsConfirmed } = JSON.parse(msg);
      let response;
      Room.findOne({ roomName }, (err, room) => {
        response = socketErrorHandling.handleRoomFinding(err, room, roomName);
        if (!response) {
          const userWithToken = room.users.find(user => {
            return user.userToken === userToken;
          });
          if (!userWithToken) {
            response = {
              error: 'User with this token is not present in this room!'
            };
          } else {
            userWithToken.userIsConfirmed = userIsConfirmed;
            room.save();
            roomHandlers.userChangedConfirmStatus(
              io,
              room,
              userWithToken.userId,
              userIsConfirmed
            );
          }
        }
      });
    });
    socket.on('disconnect', () => {
      const { roomName, userId, userName } = socketData;
      if (roomName && userId) {
        Room.findOne({ roomName: socketData.roomName }, (err, room) => {
          if (!err && room) {
            const userWithId = room.users.find(user => {
              return user.userId === userId;
            });
            userWithId.userIsOnline = false;
            roomHandlers.userLeft(io, room, userId, userName);
          }
        });
      }
    });
  });
};

module.exports = socketRouter;

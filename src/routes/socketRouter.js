const generateToken = require('../utils/generateToken');

const socketRouter = (io, Room) => {
  io.on('connection', socket => {
    console.log('Hello world');
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
          let returnedToken;
          let returnedUsername;
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
            returnedToken = userWithToken ? userToken : generateToken();
            returnedUsername = userWithToken
              ? userWithToken.userName
              : userName;
            const usersData = room.users.map(user => {
              return {
                userId: user.userId,
                userName: user.userName,
                userConfirmed: user.userConfirmed
              };
            });
            const responseRoom = {
              hostId: room.host.hostId,
              messages: room.messages,
              users: usersData
            };
            response = {
              room: responseRoom,
              userToken: returnedToken,
              userName: returnedUsername
            };
          }
        }
        socket.emit('send room', JSON.stringify(response));
      });
    });
    socket.on('disconnect', () => {
      console.log('Bye world');
    });
  });
};

module.exports = socketRouter;

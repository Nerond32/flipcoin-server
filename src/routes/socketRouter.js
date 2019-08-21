const roomValidators = require('./validators/roomValidators');
const roomSocketService = require('../services/roomSocketServices');

const socketRouter = io => {
  io.on('connection', socket => {
    let socketData = {};
    socket.on('get room', async msg => {
      const { roomName, userToken, userName } = JSON.parse(msg);
      const validationResult = roomValidators.socketGetRoom.validate({
        roomName,
        userToken,
        userName
      });
      let response;
      if (validationResult.error) {
        response = {
          error: validationResult.error.details[0].message,
          status: 400
        };
      } else {
        const result = await roomSocketService.getRoom(
          roomName,
          userToken,
          userName
        );
        ({ response } = result);
        if (!response.error) {
          socketData = {
            roomName,
            userId: response.userToken,
            userName
          };
          io.to(roomName).emit(
            'user joined',
            JSON.stringify(response.messageToClient)
          );
        }
        socket.emit('send room', JSON.stringify(response));
      }
    });
    // socket.on('send message', msg => {
    //   console.log(msg);
    //   const { roomName, userToken, message } = JSON.parse(msg);
    //   let response;
    //   Room.findOne({ roomName }, (err, room) => {
    //     response = socketErrorHandling.handleRoomFinding(err, room, roomName);
    //     if (!response) {
    //       const userWithToken = room.users.find(user => {
    //         return user.userToken === userToken;
    //       });
    //       if (!userWithToken) {
    //         response = {
    //           error: 'User with this token is not present in this room!'
    //         };
    //       } else {
    //         roomHandlers.sendMessage(io, room, message, userWithToken.userName);
    //       }
    //     }
    //   });
    // });
    // socket.on('change confirm status', msg => {
    //   const { roomName, userToken, userIsConfirmed } = JSON.parse(msg);
    //   let response;
    //   Room.findOne({ roomName }, (err, room) => {
    //     response = socketErrorHandling.handleRoomFinding(err, room, roomName);
    //     if (!response) {
    //       const userWithToken = room.users.find(user => {
    //         return user.userToken === userToken;
    //       });
    //       if (!userWithToken) {
    //         response = {
    //           error: 'User with this token is not present in this room!'
    //         };
    //       } else {
    //         userWithToken.userIsConfirmed = userIsConfirmed;
    //         room.save();
    //         roomHandlers.userChangedConfirmStatus(
    //           io,
    //           room,
    //           userWithToken.userId,
    //           userIsConfirmed
    //         );
    //       }
    //     }
    //   });
    // });
    // socket.on('disconnect', () => {
    //   const { roomName, userId, userName } = socketData;
    //   if (roomName && userId) {
    //     Room.findOne({ roomName: socketData.roomName }, (err, room) => {
    //       if (!err && room) {
    //         const userWithId = room.users.find(user => {
    //           return user.userId === userId;
    //         });
    //         userWithId.userIsOnline = false;
    //         roomHandlers.userLeft(io, room, userId, userName);
    //       }
    //     });
    //   }
    // });
  });
};

module.exports = socketRouter;

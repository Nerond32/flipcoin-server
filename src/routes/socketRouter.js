const roomValidators = require('./validators/roomValidators');
const roomSocketService = require('../services/roomSocketServices');

const socketRouter = io => {
  io.on('connection', socket => {
    let socketData = {};
    socket.on('get room', async msg => {
      const { roomName, userToken, userName } = JSON.parse(msg);
      const validationResult = roomValidators.socketGetRoom.validate({
        roomName,
        userName,
        userToken
      });
      let result;
      if (validationResult.error) {
        result = {
          response: {
            error: validationResult.error.details[0].message,
            status: 400
          }
        };
      } else {
        result = await roomSocketService.getRoom(roomName, userToken, userName);
      }
      if (result.response) {
        socket.emit('send room', JSON.stringify(result.response));
        if (!result.response.error) {
          io.to(roomName).emit(
            'user joined',
            JSON.stringify(result.messageToRoom)
          );
          socket.join(roomName);
          socketData = {
            roomName,
            userId: result.messageToRoom.user.userId
          };
        }
      }
    });
    socket.on('send message', async msg => {
      const { roomName, userToken, message } = JSON.parse(msg);
      const validationResult = roomValidators.socketSendMessage.validate({
        roomName,
        userToken,
        message
      });
      let result;
      if (validationResult.error) {
        result = {
          error: validationResult.error.details[0].message,
          status: 400
        };
      } else {
        result = await roomSocketService.sendMessage(
          roomName,
          userToken,
          message
        );
      }
      if (result.response) {
        socket.emit('error msg', JSON.stringify(result.response));
      }
      if (result.messageToRoom) {
        io.to(roomName).emit(
          'new message',
          JSON.stringify(result.messageToRoom)
        );
      }
    });
    socket.on('change confirm status', async msg => {
      const { roomName, userToken, userIsConfirmed } = JSON.parse(msg);
      const validationResult = roomValidators.socketChangeConfirmStatus.validate(
        {
          roomName,
          userToken,
          userIsConfirmed
        }
      );
      let result;
      if (validationResult.error) {
        result = {
          error: validationResult.error.details[0].message,
          status: 400
        };
      } else {
        result = await roomSocketService.userChangeConfirmStatus(
          roomName,
          userToken,
          userIsConfirmed
        );
      }
      if (result.response) {
        socket.emit('error msg', JSON.stringify(result.response));
      }
      if (result.messageToRoom) {
        io.to(roomName).emit(
          'user changed confirm status',
          JSON.stringify(result.messageToRoom)
        );
      }
    });
    socket.on('disconnect', async () => {
      const { roomName, userId } = socketData;
      if (roomName && userId) {
        const result = await roomSocketService.userLeft(roomName, userId);
        if (result.messageToRoom) {
          io.to(roomName).emit(
            'user left',
            JSON.stringify(result.messageToRoom)
          );
        }
      }
    });
  });
};

module.exports = socketRouter;

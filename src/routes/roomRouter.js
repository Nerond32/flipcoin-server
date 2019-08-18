const express = require('express');
const generateToken = require('../utils/generateToken');
const messageTypes = require('../constants/messageTypes');

const routes = Room => {
  const roomRouter = express.Router();
  roomRouter
    .route('/rooms')
    .get((req, res) => {
      Room.find((err, rooms) => {
        if (err) {
          return res.send(err);
        }
        return res.json(rooms);
      });
    })
    .post((req, res) => {
      const { roomName, userName, userToken } = req.body;
      if (Room.findOne({ roomName }, (err, room) => room).length) {
        res.sendStatus(409);
      }
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
        userConfirmed: false
      });
      newRoom.messages.push({
        msgId: generateToken(),
        msgTimeStamp: Date.now(),
        msgType: messageTypes.SPECIAL,
        msgAuthor: '',
        msgContent: `Room ${roomName} has been created by ${userName}`
      });
      const response = { userToken: hostToken };
      newRoom.save(() => {
        return res.status(201).json(response);
      });
    });
  return roomRouter;
};

module.exports = routes;

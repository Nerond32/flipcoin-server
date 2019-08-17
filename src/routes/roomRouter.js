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
      const { userName, roomName } = req.body;
      const newRoom = new Room();
      const hostToken = generateToken();
      newRoom.host = {
        hostToken,
        hostName: userName
      };
      newRoom.roomName = roomName;
      newRoom.users.push({
        userToken: hostToken,
        userName,
        userConfirmed: false
      });
      newRoom.messages.push({
        msgId: generateToken(),
        msgTimeStamp: Date.now(),
        msgType: messageTypes.SPECIAL,
        msgAuthor: '',
        msgContent: `Room ${roomName} has been created`
      });
      newRoom.save();
      const response = { userToken: hostToken };
      return res.status(201).json(response);
    });
  return roomRouter;
};

module.exports = routes;

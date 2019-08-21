const express = require('express');
const { celebrate } = require('celebrate');
const roomValidators = require('./validators/roomValidators');
const roomService = require('../services/roomApiService');

const routes = Room => {
  const roomRouter = express.Router();
  roomRouter.post(
    '/rooms',
    celebrate(roomValidators.createRoom),
    (req, res) => {
      const { roomName, userName, userToken } = req.body;
      Room.findOne({ roomName }, async (err, room) => {
        if (room) {
          return res.sendStatus(409);
        }
        const response = await roomService.createRoom(
          roomName,
          userName,
          userToken
        );
        return res.status(201).json(response);
      });
    }
  );
  return roomRouter;
};

module.exports = routes;

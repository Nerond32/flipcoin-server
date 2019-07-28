const express = require('express');

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
      const room = new Room();
      room.name = req.body.roomName;
      room.users.push({ name: req.body.username, confirmed: false });
      room.messages.push({
        source: 'Room',
        content: `${req.body.username} entered the room`
      });
      room.creationDate = Date.now();
      room.save();
      return res.sendStatus(201);
    });
  roomRouter.route('/rooms/:roomName').get((req, res) => {
    const query = {};
    query.name = req.params.roomName;
    Room.findOne({ name: query.name }, (err, room) => {
      if (err) {
        return res.send(err);
      }
      if (!room) {
        return res.sendStatus(404);
      }
      return res.json(room);
    });
  });
  return roomRouter;
};

module.exports = routes;

const express = require('express');
const generateToken = require('../utils/generateToken');

const routes = (Room, wsInstance) => {
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
      const hostToken = generateToken();
      const room = new Room();
      room.hostToken = hostToken;
      room.name = req.body.roomName;
      room.users.push({
        token: hostToken,
        name: req.body.username,
        confirmed: false
      });
      room.messages.push({
        source: 'Room',
        content: `${req.body.username} entered the room`
      });
      room.creationDate = Date.now();
      room.save();
      const response = { token: hostToken };
      return res.status(201).json(response);
    });
  roomRouter.route('/rooms/:roomName').post((req, res) => {
    const { token } = req.headers || '';
    const { username } = req.body || '';
    const { roomName } = req.params;
    Room.findOne({ name: roomName }, (err, room) => {
      if (err) {
        return res.send(err);
      }
      if (!room) {
        return res.sendStatus(404);
      }
      const existingUser = room.users.find(user => {
        return user.token === token;
      });
      let userToken;
      if (existingUser) {
        userToken = token;
      } else {
        userToken = generateToken();
        const newUser = { token: userToken, name: username, confirmed: false };
        room.users.push(newUser);
        room.save();
      }
      const response = {
        token: userToken,
        roomName: room.name,
        messages: room.messages,
        users: room.users
      };
      return res.json(response);
    });
  });
  roomRouter.ws('/rooms/:roomName/chat', (ws, req) => {
    console.log('aaa');
    console.log(req.cookies);
    ws.on('message', msg => {
      const parsedMsg = JSON.parse(msg);
      Room.findOne({ name: parsedMsg.roomName }, (err, room) => {
        const newMessage = {
          source: parsedMsg.sender,
          content: parsedMsg.message
        };
        room.messages.push(newMessage);
        room.save();
        wsInstance.clients.forEach(client => {
          client.send(JSON.stringify(newMessage));
        });
      });
    });
  });
  return roomRouter;
};

module.exports = routes;

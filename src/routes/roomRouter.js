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
      const { username, roomName } = req.body;
      const hostToken = generateToken();
      const room = new Room();
      room.hostName = username;
      room.hostToken = hostToken;
      room.name = roomName;
      room.users.push({
        token: hostToken,
        name: username,
        confirmed: false
      });
      room.messages.push({
        source: 'Room',
        content: `${username} entered the room`
      });
      room.creationDate = Date.now();
      room.save();
      const response = { username, token: hostToken };
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
        if (!username) {
          return res.sendStatus(403);
        }
        userToken = generateToken();
        const newUser = { token: userToken, name: username, confirmed: false };
        room.users.push(newUser);
        room.save();
        room.messages.push({
          source: 'Room',
          content: `${username} entered the room`
        });
      }
      const response = {
        hostName: room.hostName,
        token: userToken,
        name: room.name,
        messages: room.messages,
        users: room.users,
        username: username || existingUser.name
      };
      return res.json(response);
    });
  });
  roomRouter.ws('/rooms/:roomName/chat', (ws, req) => {
    ws.on('message', msg => {
      console.log('bbb');
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

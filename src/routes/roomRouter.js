const express = require('express');
const generateToken = require('../utils/generateToken');
const messageTypes = require('../constants/messageTypes');

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
        msgType: messageTypes.SPECIAL,
        msgAuthor: '',
        msgContent: `Room ${roomName} has been created`
      });
      newRoom.creationDate = Date.now();
      newRoom.save();
      const response = { userName, userToken: hostToken };
      return res.status(201).json(response);
    });
  roomRouter.route('/rooms/:roomName').post((req, res) => {
    const userToken = req.headers.usertoken || '';
    const { userName } = req.body || '';
    const { roomName } = req.params;
    Room.findOne({ roomName }, (err, room) => {
      if (err) {
        return res.send(err);
      }
      if (!room) {
        return res.sendStatus(404);
      }
      const existingUser = room.users.find(user => {
        return user.userToken === userToken || user.userName === userName;
      });

      let newToken;
      if (!existingUser) {
        if (!userName) {
          return res.sendStatus(400);
        }
        newToken = generateToken();
        const newUser = { userToken: newToken, userName, userConfirmed: false };
        room.users.push(newUser);
        room.save();
      } else if (existingUser.userToken !== userToken) {
        return res.sendStatus(409);
      }
      const { host, messages, users } = room;
      const response = {
        hostName: host.hostName,
        userToken: newToken || userToken,
        roomName,
        messages,
        users,
        userName: userName || existingUser.userName
      };
      return res.json(response);
    });
  });
  roomRouter.ws('/rooms/:roomName/chat', (ws, req) => {
    const { roomName } = req.params;
    const { userName } = req.query;
    const sendMessage = newMessage => {
      wsInstance.clients.forEach(client => {
        client.send(JSON.stringify(newMessage));
      });
    };
    const addAndSendMessage = (newMessage, room) => {
      room.messages.push(newMessage);
      room.save();
      sendMessage(newMessage);
    };
    Room.findOne({ roomName }, (err, room) => {
      if (err || !room) {
        console.log('Room does not exist');
      } else {
        const newMessage = {
          msgId: generateToken(),
          msgType: messageTypes.USER_JOINED,
          msgAuthor: 'Room',
          msgContent: `${userName} entered the room`
        };
        addAndSendMessage(newMessage, room);
      }
    });
    ws.on('message', msg => {
      const parsedMsg = JSON.parse(msg);
      Room.findOne({ roomName: parsedMsg.roomName }, (err, room) => {
        if (err || !room) {
          console.log('Room does not exist');
        } else {
          const newMessage = {
            msgId: generateToken(),
            msgType: messageTypes.MESSAGE,
            msgAuthor: parsedMsg.sender,
            msgContent: parsedMsg.message
          };
          addAndSendMessage(newMessage, room);
        }
      });
    });
    ws.on('close', reason => {
      Room.findOne({ roomName }, (err, room) => {
        if (err || !room) {
          console.log('Room does not exist');
        } else {
          let message = `${userName} left the room`;
          if (reason !== 1000 && reason !== 1001) {
            message += '(connection lost)';
          }
          const newMessage = {
            msgId: generateToken(),
            msgType: messageTypes.USER_LEFT,
            msgAuthor: 'Room',
            msgContent: message
          };
          addAndSendMessage(newMessage, room);
          const leaveeIndex = room.users.findIndex(
            user => user.userName === userName
          );
          room.users.splice(leaveeIndex, 1);
        }
      });
    });
  });
  return roomRouter;
};

module.exports = routes;

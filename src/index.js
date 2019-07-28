const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/roomAPI');
const port = process.env.PORT || 7777;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const Room = require('./models/roomModel');

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
    room.name = req.body.name;
    room.users.push(req.body.username);
    room.messages.push({
      source: 'Room',
      content: `${req.body.username} entered the room`
    });
    room.creationDate = Date.now();
    room.save();
    return res.status(201).json(room);
  });

app.use('/api', roomRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${port}`);
});

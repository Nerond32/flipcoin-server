const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/roomAPI');
const app = express();
const port = process.env.PORT || 7777;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const Room = require('./models/roomModel');
const roomRouter = require('./routes/roomRouter')(Room);

app.use('/api', roomRouter);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${port}`);
});

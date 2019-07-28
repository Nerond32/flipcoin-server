const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/roomAPI');
const app = express();
const port = process.env.PORT || 7777;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const Room = require('./models/roomModel');
const roomRouter = require('./routes/roomRouter')(Room);

const allowedOrigins = ['http://localhost:3000'];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  })
);

app.use('/api', roomRouter);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${port}`);
});

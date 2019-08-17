const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

const allowedOrigins = ['http://localhost:3000'];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
const Room = require('../models/roomModel');
const roomRouter = require('../routes/roomRouter')(Room);

app.use('/api', roomRouter);

module.exports = app;

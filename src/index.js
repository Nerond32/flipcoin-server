const mongoose = require('mongoose');
const app = require('./utils/initExpressApp');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Room = require('./models/roomModel');
require('./routes/socketRouter')(io, Room);

mongoose.connect('mongodb://localhost/roomAPI', { useNewUrlParser: true });

const port = process.env.PORT || 7777;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${port}`);
});

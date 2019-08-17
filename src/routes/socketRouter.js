const socketRouter = io => {
  io.on('connection', () => {
    console.log('Hello world');
  });
};

module.exports = socketRouter;

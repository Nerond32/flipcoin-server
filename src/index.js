const express = require('express');

const port = process.env.PORT || 7777;
const app = express();

const roomRouter = express.Router();
roomRouter.route('/rooms').get((req, res) => {
  const response = { hello: 'hello world' };
  res.json(response);
});

app.use('/api', roomRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${port}`);
});

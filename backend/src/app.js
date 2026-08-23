const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./middleware/logger');
app.use(express.json());
app.use(cors());
app.use(logger);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const routes = require('./routes/routes');
app.use('/api', routes);

module.exports = app;
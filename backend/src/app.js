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
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);

module.exports = app;
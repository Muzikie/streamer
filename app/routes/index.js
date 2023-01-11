// eslint-disable-next-line new-cap
const express = require('express');
const bodyParser = require('body-parser');

// Require routes
const metaRouter = require('./meta');
const audioRouter = require('./audio');
const collectionRouter = require('./collection');
const usersRouter = require('./user');

const app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log(`Resource requested: ${req.method} ${req.originalUrl}`);
  next(); // make sure we go to the next routes and don't stop here
});

app.use('/meta', metaRouter);
app.use('/audios', audioRouter);
app.use('/collections', collectionRouter);
app.use('/users', usersRouter);

module.exports = app;

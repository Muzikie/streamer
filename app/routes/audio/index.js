// eslint-disable-next-line new-cap
const audioRouter = require('express').Router(); //router

// Controllers
const { getAllAudios } = require('./getAll');
const { getAudio } = require('./get');
const { createAudio } = require('./create');
// const { deleteAudio } = require('./delete');
const { updateAudio } = require('./update');
const { streamAudio } = require('./stream');

// validators
const streamValidator = require('../../validation/audio/stream');

// Routes
audioRouter
  .get('/stream/:id', streamValidator, streamAudio);
audioRouter
  .route('/:id')
  .get(getAudio)
  // .delete(deleteAudio)
  .patch(updateAudio);
audioRouter
  .route('/')
  .get(getAllAudios)
  .post(createAudio);

module.exports = audioRouter;

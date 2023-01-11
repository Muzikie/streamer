// eslint-disable-next-line new-cap
const userRouter = require('express').Router(); //router

// Controllers
const { getAllUsers } = require('./getAll');
const { getUser } = require('./get');
const { createUser } = require('./create');
// const { deleteUser } = require('./delete');
const { updateUser } = require('./update');
const { getAudios } = require('./getAudios');
const { getCollections } = require('./getCollections');

// validators
// @todo add validators

// Routes
userRouter
  .route('/:address/audios')
  .get(getAudios)
userRouter
  .route('/:address/collections')
  .get(getCollections)
userRouter
  .route('/:address')
  .get(getUser)
  // .delete(deleteUser)
  .patch(updateUser);
userRouter.route('/')
  .get(getAllUsers)
  .post(createUser);

module.exports = userRouter;

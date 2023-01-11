const md5 = require('md5');

const User = require('../../models/user');
const { RESPONSE_STATUSES, HTTP_MESSAGES } = require('../../constants');
const { getCoverExtension } = require('../../utils/file');
const { PHOTOS } = require('../../../config/api');

// eslint-disable-next-line max-statements
exports.createUser = async (req, res) => {
  try {
    const file = req.files.file;
    const user = JSON.parse(req.body.data);

    // Check if collectionID is unique
    const userExists = await User.find({ address: user.address });
    if (userExists.length) {
      throw new Error(HTTP_MESSAGES.COLLECTION_EXISTS);
    }

    // Validate signature
    const md5Hash = md5(file.data);
    if (md5Hash !== user.meta) {
      throw new Error(HTTP_MESSAGES.INVALID_SIGNATURE);
    }

    // Save cover and collection
    file.mv(`.${PHOTOS.PATH}` + user.address + getCoverExtension(file.mimetype));
    const data = await User.create(user);

    // Respond
    res.status(201).json({
      status: RESPONSE_STATUSES.SUCCESS,
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: RESPONSE_STATUSES.ERROR,
      message: error.message,
    });
  }
};

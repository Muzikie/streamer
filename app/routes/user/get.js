const User = require('../../models/user');
const { RESPONSE_STATUSES } = require('../../constants');

exports.getUser = async (req, res) => {
  try {
    const data = await User.find({ address: req.params.address });
    res.status(200).json({
      status: RESPONSE_STATUSES.SUCCESS,
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: RESPONSE_STATUSES.ERROR,
      message: error.message,
    });
  }
};

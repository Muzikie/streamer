const User = require('../../models/user');
const { RESPONSE_STATUSES } = require('../../constants');

exports.deleteUser = async (req, res) => {
  try {
    await User.deleteOne({ address: req.params.address });
    res.status(204).json({
      status: RESPONSE_STATUSES.SUCCESS,
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: RESPONSE_STATUSES.ERROR,
      message: error.message,
    });
  }
};

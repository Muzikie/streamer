const User = require('../../models/user');
const { RESPONSE_STATUSES } = require('../../constants');

exports.updateUser = async (req, res) => {
  try {
    const data = await User.updateOne({ address: req.params.address }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
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

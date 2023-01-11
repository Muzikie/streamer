const Audio = require('../../models/audio');
const APIFeatures = require('../../utils/apiFeatures');
const { RESPONSE_STATUSES } = require('../../constants');

exports.getAllAudios = async (req, res) => {
  try {
    const features = new APIFeatures(Audio.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.query;
    
    res.status(200).json({
      status: RESPONSE_STATUSES.SUCCESS,
      data,
      meta: {
        results: data.length,
        requestedAt: req.requestTime,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: RESPONSE_STATUSES.ERROR,
      message: error.message,
    });
  }
};

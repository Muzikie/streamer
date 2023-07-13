const { Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const business = require('./business');

const getAudios = async params => {
	// Store logs
	if (params.audioID) logger.debug(`Retrieved audio with ID ${params.audioID} from Lisk Core`);
	else if (params.creatorAddress) logger.debug(`Retrieved audio with creatorAddress: ${params.creatorAddress} from Lisk Core`);
	else logger.debug(`Retrieved audios with custom search: ${util.inspect(params)} from Lisk Core`);

	// Get data from server
	const response = await business.getAudios(params);

	return response;
};

module.exports = {
	getAudios,
};

const { Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const business = require('./business');

const getProfiles = async params => {
	// Store logs
	if (params.profileID) logger.debug(`Retrieved profile with ID ${params.profileID} from Lisk Core`);
	else if (params.creatorAddress) logger.debug(`Retrieved profile with creatorAddress: ${params.creatorAddress} from Lisk Core`);
	else logger.debug(`Retrieved profile with custom search: ${util.inspect(params)} from Lisk Core`);

	// Get data from server
	const response = await business.getProfiles(params);

	return response;
};

module.exports = {
	getProfiles,
};

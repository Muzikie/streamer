const { Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const business = require('./business');

const getCollections = async params => {
	// Store logs
	if (params.collectionID) logger.debug(`Retrieved collection with ID ${params.collectionID} from Lisk Core`);
	else if (params.creatorAddress) logger.debug(`Retrieved collection with creatorAddress: ${params.creatorAddress} from Lisk Core`);
	else logger.debug(`Retrieved collection with custom search: ${util.inspect(params)} from Lisk Core`);

	// Get data from server
	const response = await business.getCollections(params);

	return response;
};

module.exports = {
	getSubscriptions,
};

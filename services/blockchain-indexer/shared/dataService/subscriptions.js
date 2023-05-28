const { Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const business = require('./business');

const getSubscriptions = async params => {
	// Store logs
	if (params.subscriptionID) logger.debug(`Retrieved subscription with ID ${params.subscriptionID} from Lisk Core`);
	else if (params.creatorAddress) logger.debug(`Retrieved subscription with creatorAddress: ${params.creatorAddress} from Lisk Core`);
	else logger.debug(`Retrieved subscriptions with custom search: ${util.inspect(params)} from Lisk Core`);

	// Get data from server
	const response = await business.getSubscriptions(params);

	return response;
};

module.exports = {
	getSubscriptions,
};

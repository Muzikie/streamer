const { Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const business = require('./business');

const getBadges = async params => {
	// Store logs
	if (params.awardedTo) logger.debug(`Retrieved active badge for member ${params.awardedTo} from Lisk Core`);
	if (params.badgeID) logger.debug(`Retrieved badge with ID ${params.badgeID} from Lisk Core`);
	else if (params.type) logger.debug(`Retrieved badge with creatorAddress: ${params.type} from Lisk Core`);
	else logger.debug(`Retrieved badge with custom search: ${util.inspect(params)} from Lisk Core`);

	// Get data from server
	const response = await business.getBadges(params);

	return response;
};

module.exports = {
	getBadges,
};

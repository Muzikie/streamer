const { Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const business = require('./business');

const getAnchors = async params => {
	// Store logs
	if (params.anchorID) logger.debug(`Retrieved anchor with ID ${params.anchorID} from Lisk Core`);
	else if (params.submitter) logger.debug(`Retrieved anchor with submitter: ${params.submitter} from Lisk Core`);
	else if (params.winner) logger.debug('Retrieved winner anchors from Lisk Core');
	else logger.debug(`Retrieved anchors with custom search: ${util.inspect(params)} from Lisk Core`);

	// Get data from server
	const response = await business.getAnchors(params);

	return response;
};

module.exports = {
	getAnchors,
};

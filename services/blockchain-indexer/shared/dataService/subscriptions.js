/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const { CacheRedis, Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const business = require('./business');

// @todo implement this for subscriptions
const getTotalNumberOfSubscriptions = () => 10000;

const getSubscriptions = async params => {
	// Set default value
	let data = [];
	const meta = {
		count: 0,
		offset: parseInt(params.offset, 10) || 0,
		total: 0,
	};

	// Store logs
	if (params.subscriptionID) logger.debug(`Retrieved subscription with ID ${params.subscriptionID} from Lisk Core`);
	else if (params.creatorAddress) logger.debug(`Retrieved subscription with creatorAddress: ${params.creatorAddress} from Lisk Core`);
	else logger.debug(`Retrieved subscriptions with custom search: ${util.inspect(params)} from Lisk Core`);

	// Get data from server
	const response = await business.getSubscriptions(params);

	// Normalize response
	if (response.data) data = response.data;
	if (response.meta) {
		meta.count = response.meta.count || response.data.length;
		if (params.subscriptionID) {
			meta.total = response.data ? 1 : 0;
		} else if (params.creatorAddress) {
			meta.total = response.meta.total;
		} else {
			meta.total = await getTotalNumberOfSubscriptions();
		}
	}

	return {
		data,
		meta,
	};
};

module.exports = {
	getSubscriptions,
};

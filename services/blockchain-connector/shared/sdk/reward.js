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
const { Exceptions: { TimeoutException } } = require('lisk-service-framework');

const { timeoutMessage, invokeEndpoint } = require('./client');

let rewardTokenID;

const getRewardTokenID = async () => {
	if (!rewardTokenID) {
		try {
			// TODO: Update endpoint once exposed by SDK
			// Ref: https://github.com/LiskHQ/lisk-sdk/issues/7834
			const response = await invokeEndpoint('reward_getRewardTokenID');
			rewardTokenID = response.error ? null : response;
		} catch (err) {
			if (err.message.includes(timeoutMessage)) {
				throw new TimeoutException('Request timed out when calling \'getRewardTokenID\'.');
			}
			throw err;
		}
	}
	return rewardTokenID;
};

const getDefaultRewardAtHeight = async height => {
	try {
		const defaultReward = await invokeEndpoint('reward_getDefaultRewardAtHeight', { height });
		return defaultReward.error ? null : defaultReward;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException(`Request timed out when calling 'getDefaultRewardAtHeight' for block height:${height}`);
		}
		throw err;
	}
};

module.exports = {
	getRewardTokenID,
	getDefaultRewardAtHeight,
};

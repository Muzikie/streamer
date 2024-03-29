/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const {
	Logger,
	Exceptions: { TimeoutException },
} = require('lisk-service-framework');

const { timeoutMessage, invokeEndpoint } = require('./client');
const { getNodeInfo } = require('./endpoints_1');

const logger = Logger();

let mainchainID;

const getChainAccount = async (chainID) => {
	try {
		const chainAccount = await invokeEndpoint('interoperability_getChainAccount', { chainID });
		return chainAccount;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getChainAccount\'.');
		}
		logger.warn(`Error returned when invoking 'interoperability_getChainAccount' with chainID: ${chainID}.\n${err.stack}`);
		throw err;
	}
};

const getMainchainID = async () => {
	try {
		if (!mainchainID) {
			// const mainchainID = await invokeEndpoint('interoperability_getMainchainID');

			// TODO: Remove this and use SDK endpoint once following issue is closed: https://github.com/LiskHQ/lisk-sdk/issues/8309
			const { chainID } = await getNodeInfo();
			const LENGTH_CHAIN_ID = 4 * 2; // Each byte is represented with 2 nibbles
			mainchainID = chainID.substring(0, 2).padEnd(LENGTH_CHAIN_ID, '0');
		}

		return mainchainID;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getMainchainID\'.');
		}
		logger.warn(`Error returned when invoking 'interoperability_getMainchainID'.\n${err.stack}`);
		throw err;
	}
};

module.exports = {
	getChainAccount,
	getMainchainID,
};

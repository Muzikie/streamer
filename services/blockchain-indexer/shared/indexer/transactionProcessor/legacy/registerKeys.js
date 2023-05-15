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
const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT_PRIMARY = config.endpoints.mysqlPrimary;
const accountsTableSchema = require('../../../database/schema/accounts');
const validatorsTableSchema = require('../../../database/schema/validators');

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT_PRIMARY,
);

const getValidatorsTable = () => getTableInstance(
	validatorsTableSchema.tableName,
	validatorsTableSchema,
	MYSQL_ENDPOINT_PRIMARY,
);

// Command specific constants
const COMMAND_NAME = 'registerKeys';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const validatorsTable = await getValidatorsTable();

	const account = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		publicKey: tx.senderPublicKey,
		isValidator: true,
		blsKey: tx.params.blsKey,
		proofOfPosession: tx.params.proofOfPosession,
		generatorKey: tx.params.generatorKey,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing validator with address ${account.address}.`);
	await validatorsTable.upsert(account, dbTrx);
	logger.debug(`Indexed validator with address ${account.address}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const validatorsTable = await getValidatorsTable();

	// Remove the validator details from the table on transaction reversal
	const account = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		publicKey: tx.senderPublicKey,
		isValidator: true,
		blsKey: null,
		proofOfPosession: null,
		generatorKey: null,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Remove validator entry for address ${account.address}.`);
	const validatorPK = account[validatorsTableSchema.primaryKey];
	await validatorsTable.deleteByPrimaryKey(validatorPK, dbTrx);
	logger.debug(`Removed validator entry for address ${account.address}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

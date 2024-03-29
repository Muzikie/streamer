const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const accountsTableSchema = require('../../../database/schema/accounts');
const subscriptionsTableSchema = require('../../../database/schema/subscriptions');

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT,
);

const getSubscriptionsTable = () => getTableInstance(
	subscriptionsTableSchema.tableName,
	subscriptionsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const subscriptionsTable = await getSubscriptionsTable();

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
	const devAccount = { address: senderAddress };

	logger.trace(`Updating account index for the account with address ${senderAddress}.`);
	await accountsTable.upsert(devAccount, dbTrx);
	logger.debug(`Updated account index for the account with address ${senderAddress}.`);

	logger.trace(`Indexing subscription with address ${senderAddress}.`);

	// @todo make sure the process won't break if the event doesn't exist. e.g. do not index.
	const { data: eventData = {} } = events.find(e => e.module === 'subscription' && e.name === 'subscriptionCreated');

	const subscriptionsNFT = {
		...eventData,
		...tx.params,
	};

	await subscriptionsTable.upsert(subscriptionsNFT, dbTrx);
	logger.debug(`Indexed subscription with ID ${eventData.subscriptionID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const subscriptionsTable = await getSubscriptionsTable();

	const { data: eventData } = events.find(e => e.module === 'subscription' && e.name === 'subscriptionCreated');

	logger.trace(`Remove subscription entry for ID ${eventData.subscriptionID}.`);
	await subscriptionsTable.delete({ subscriptionID: eventData.subscriptionID }, dbTrx);
	logger.debug(`Removed subscription entry for ID ${eventData.subscriptionID}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

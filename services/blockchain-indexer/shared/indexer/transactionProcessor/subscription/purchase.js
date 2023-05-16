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
const COMMAND_NAME = 'purchase';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const subscriptionsTable = await getSubscriptionsTable();

	const oldAccount = accountsTable.find(
		{ address: getLisk32AddressFromPublicKey(tx.senderPublicKey) },
		dbTrx,
	);

	const oldIds = oldAccount ? oldAccount.subscription.owned : [];

	const account = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		subscription: {
			owned: [...oldIds, dbTrx.id],
			shared: dbTrx.id,
		},
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing subscription with address ${account.address}.`);
	await subscriptionsTable.upsert(account, dbTrx);
	logger.debug(`Indexed subscription with address ${account.address}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const subscriptionsTable = await getSubscriptionsTable();

	const oldAccount = accountsTable.find(
		{ address: getLisk32AddressFromPublicKey(tx.senderPublicKey) },
		dbTrx,
	);

	// Remove the validator details from the table on transaction reversal
	const account = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		publicKey: tx.senderPublicKey,
		subscription: {
			owned: oldAccount.subscription.owned.filter(id => id !== dbTrx.id),
			shared: oldAccount.subscription.shared === dbTrx.id ? null : oldAccount.subscription.shared,
		},
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Remove subscription entry for address ${account.address}.`);
	const subscriptionPK = account[subscriptionsTableSchema.primaryKey];
	await subscriptionsTable.deleteByPrimaryKey(subscriptionPK, dbTrx);
	logger.debug(`Removed subscription entry for address ${account.address}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');
const { DEV_ADDRESS } = require('../../../constants');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const accountsTableSchema = require('../../../database/schema/accounts');
const subscriptionsTableSchema = require('../../../database/schema/subscriptions');
const membersTableSchema = require('../../../database/schema/members');

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

const getMembersTable = () => getTableInstance(
	membersTableSchema.tableName,
	membersTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'purchase';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const subscriptionsTable = await getSubscriptionsTable();
	const membersTable = await getMembersTable();

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
	const { subscriptionID } = tx.params;

	logger.trace(`Indexing subscription with address ${subscriptionID}.`);
	const subscriptionNFT = await subscriptionsTable.find(
		{ subscriptionID },
		['subscriptionID', 'creatorAddress', 'price', 'consumable', 'streams', 'maxMembers'],
		dbTrx,
	);
	subscriptionNFT.creatorAddress = senderAddress;
	await subscriptionsTable.upsert(subscriptionNFT, dbTrx);
	logger.debug(`Indexed subscription with ID ${dbTrx.id}.`);

	// Update members in accounts and members table
	await BluebirdPromise.map(
		tx.params.members,
		async member => {
			const oldAccount = { address: member };
			logger.trace(`Updating account index for the account with address ${member}.`);
			await accountsTable.upsert(oldAccount, dbTrx);
			logger.debug(`Updated account index for the account with address ${member}.`);

			const memberData = {
				id: member.concat(`-${tx.nonce.toString()}`),
				address: member,
				addedBy: tx.id,
				shared: subscriptionID,
			};

			logger.trace(`Updating member index for the member with address ${member}.`);
			await membersTable.upsert(memberData, dbTrx);
			logger.debug(`Updated member index for the member with address ${member}.`);
			return true;
		},
		{ concurrency: tx.params.members.length },
	);

	// Update sender in accounts table
	const senderAccount = { address: senderAddress };
	await accountsTable.upsert(senderAccount, dbTrx);
	logger.trace(`Indexed subscription purchase with account address ${senderAddress}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const subscriptionsTable = await getSubscriptionsTable();
	const membersTable = await getMembersTable();

	const { subscriptionID } = tx.params;

	const subscriptionNFT = await subscriptionsTable.find(
		{ subscriptionID },
		['subscriptionID', 'creatorAddress', 'price', 'consumable', 'streams', 'maxMembers'],
		dbTrx,
	);
	subscriptionNFT.creatorAddress = DEV_ADDRESS;
	await subscriptionsTable.upsert(subscriptionNFT, dbTrx);

	await membersTable.delete({ shared: subscriptionID }, dbTrx);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

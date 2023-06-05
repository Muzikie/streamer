const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const accountsTableSchema = require('../../../database/schema/accounts');
const collectionsTableSchema = require('../../../database/schema/collections');
const {
	MODULE_NAME_COLLECTION,
	EVENT_NAME_COLLECTION_CREATED,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT,
);

const getCollectionsTable = () => getTableInstance(
	collectionsTableSchema.tableName,
	collectionsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const collectionsTable = await getCollectionsTable();

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);

	const account = {
		address: senderAddress,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing collections with address ${account.address}.`);

	const { data: eventData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_COLLECTION
			&& name === EVENT_NAME_COLLECTION_CREATED,
	);

	const collectionsNFT = {
		...eventData,
		...tx.params,
	};

	await collectionsTable.upsert(collectionsNFT, dbTrx);
	logger.debug(`Indexed collection with ID ${eventData.collectionsID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const collectionsTable = await getCollectionsTable();

	const oldAccount = accountsTable.find(
		{ address: getLisk32AddressFromPublicKey(tx.senderPublicKey) },
		dbTrx,
	);

	// Remove the validator details from the table on transaction reversal
	const account = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		publicKey: tx.senderPublicKey,
		collections: {
			owned: oldAccount.collections.owned.filter(id => id !== dbTrx.id),
			shared: null,
		},
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Remove collection entry for address ${account.address}.`);
	const collectionPK = account[collectionsTableSchema.primaryKey];
	await collectionsTable.deleteByPrimaryKey(collectionPK, dbTrx);
	logger.debug(`Removed collection entry for ID ${collectionPK}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

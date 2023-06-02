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
	EVENT_NAME_COLLECTION_ATTRIBUTESET,
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
const COMMAND_NAME = 'attributeSet';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	// const accountsTable = await getAccountsTable();
	const collectionsTable = await getCollectionsTable();

	// const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);

	// const account = {
	// 	address: senderAddress,
	// };

	// 	logger.trace(`Updating account index for the account with address ${account.address}.`);
	// 	await accountsTable.upsert(account, dbTrx);
	// 	logger.debug(`Updated account index for the account with address ${account.address}.`);
	// 	logger.trace(`Indexing collections with address ${account.address}.`);

	const { data: eventData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_COLLECTION
			&& name === EVENT_NAME_COLLECTION_ATTRIBUTESET,
	);

	// Thanks to blockchain logic, collectionNFTs will remain in hands of it's actual owner 
	// and there are no possible vulnerability to change the owner of a CollectionNFT via fraud
	// then we don't need to implement the logic here for preventing creatorAddress change
	const collectionsNFT = {
		...eventData,
		...tx.params,
	};

	await collectionsTable.update(collectionsNFT, dbTrx);
	logger.debug(`Indexed collection with ID ${eventData.collectionsID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {

};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

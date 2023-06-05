const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const collectionsTableSchema = require('../../../database/schema/collections');

const getCollectionsTable = () => getTableInstance(
	collectionsTableSchema.tableName,
	collectionsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'transfer';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const collectionsTable = await getCollectionsTable();
	const [collectionNFT] = await collectionsTable.find(
		{ collectionID: tx.params.collectionID },
		['collectionID', 'name', 'collectionType', 'releaseYear'],
		dbTrx,
	);

	collectionNFT.creatorAddress = tx.params.address;
	logger.trace(`Indexing collections with new address ${collectionNFT.creatorAddress}.`);

	await collectionsTable.upsert(collectionNFT, dbTrx);
	logger.debug(`Indexed collection with ID ${collectionNFT.collectionsID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

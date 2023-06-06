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
const COMMAND_NAME = 'destroy';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const collectionsTable = await getCollectionsTable();
	const [collectionNFT] = await collectionsTable.find(
		{ collectionID: tx.params.collectionID },
		['collectionID'],
		dbTrx,
	);

	logger.trace(`Deleting collection with ID ${collectionNFT.collectionID}.`);
	await collectionsTable.delete(collectionNFT, dbTrx);
	logger.debug(`Deleted collection with ID ${collectionNFT.collectionsID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

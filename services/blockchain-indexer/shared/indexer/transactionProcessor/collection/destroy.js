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
	const { collectionID } = tx.params;

	logger.trace(`Deleting collection with ID ${collectionID}.`);
	await collectionsTable.delete({ collectionID }, dbTrx);
	logger.debug(`Deleted collection with ID ${collectionID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

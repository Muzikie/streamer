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
const COMMAND_NAME = 'setAttributes';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const collectionsTable = await getCollectionsTable();
	const [collection] = await collectionsTable.find(
		{ collectionID: tx.params.collectionID },
		['collectionID'],
	);

	if (typeof collection !== 'undefined') {
		logger.trace(`Update collection with ID ${tx.params.collectionID}.`);
		await collectionsTable.upsert(tx.params, dbTrx);
		logger.debug(`Updated collection with ID ${tx.params.collectionID}.`);
	}
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {

};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const collectionsTableSchema = require('../../../database/schema/collections');
const {
	MODULE_NAME_COLLECTION,
	EVENT_NAME_COLLECTION_ATTRIBUTE_SET,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getCollectionsTable = () => getTableInstance(
	collectionsTableSchema.tableName,
	collectionsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'setAttributes';

const updateCollection = async (collectionsTable, collectionID, updates, dbTrx) => {
	const where = {
		collectionID,
	};

	await collectionsTable.update({ where, updates }, dbTrx);
	logger.debug(`Updated collection with ID ${collectionID}.`);
};

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const collectionsTable = await getCollectionsTable();

	const { data: eventData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_COLLECTION
			&& name === EVENT_NAME_COLLECTION_ATTRIBUTE_SET,
	);

	const { collectionID, ...updates } = {
		...eventData,
		...tx.params,
	};

	await updateCollection(collectionsTable, collectionID, updates, dbTrx);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {

};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

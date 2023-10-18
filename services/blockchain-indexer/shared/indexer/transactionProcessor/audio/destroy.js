const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const anchorsTableSchema = require('../../../database/schema/anchors');
const imagesTableSchema = require('../../../database/schema/images');

const {
	MODULE_NAME_ANCHOR,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getAnchorsTable = () => getTableInstance(
	anchorsTableSchema.tableName,
	anchorsTableSchema,
	MYSQL_ENDPOINT,
);

const getImagesTable = () => getTableInstance(
	imagesTableSchema.tableName,
	imagesTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'destroy';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const { data: commandExecutedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_COMMAND_EXECUTION_RESULT,
	);
	if (!commandExecutedData.success) {
		return false;
	}

	const { anchorID } = tx.params;

	const anchorsTable = await getAnchorsTable();
	const imagesTable = await getImagesTable();

	logger.trace(`Removing anchor index for the anchor with ID ${anchorID}.`);
	await anchorsTable.delete({ anchorID }, dbTrx);
	logger.trace(`Removed anchor index for the anchor with ID ${anchorID}.`);

	logger.trace(`Removing images index for the anchor with ID ${anchorID}.`);
	await imagesTable.delete({ anchorID }, dbTrx);
	logger.trace(`Removed images index for the anchor with ID ${anchorID}.`);

	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

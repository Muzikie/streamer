const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const imagesTableSchema = require('../../../database/schema/images');

const {
	MODULE_NAME_ANCHOR,
	EVENT_NAME_ANCHOR_VOTED,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getImagesTable = () => getTableInstance(
	imagesTableSchema.tableName,
	imagesTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'vote';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const { data: commandExecutedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_COMMAND_EXECUTION_RESULT,
	);
	if (!commandExecutedData.success) {
		return false;
	}

	const imagesTable = await getImagesTable();

	const { anchorID } = tx.params;

	// Use event data to get anchorID
	const { data: anchorVotedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_ANCHOR_VOTED,
	);

	await BluebirdPromise.map(
		anchorVotedData.images,
		async image => {
			const info = {
				...image,
				anchorID,
			};
			logger.trace(`Updating image index for the account with address ${image.address}.`);
			await imagesTable.upsert(info, dbTrx);
			logger.debug(`Updated image index for the account with address ${image.address}.`);
			return true;
		},
		{ concurrency: anchorVotedData.images.length },
	);

	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

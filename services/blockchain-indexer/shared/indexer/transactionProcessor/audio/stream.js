const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const ownersTableSchema = require('../../../database/schema/owners');

const {
	MODULE_NAME_AUDIO,
	EVENT_NAME_AUDIO_STREAMED,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getOwnersTable = () => getTableInstance(
	ownersTableSchema.tableName,
	ownersTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'stream';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const { data: commandExecutedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_COMMAND_EXECUTION_RESULT,
	);
	if (!commandExecutedData.success) {
		return false;
	}

	const ownersTable = await getOwnersTable();

	const { audioID } = tx.params;

	// Use event data to get audioID
	const { data: audioStreamedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_AUDIO_STREAMED,
	);

	await BluebirdPromise.map(
		audioStreamedData.owners,
		async owner => {
			const info = {
				...owner,
				audioID,
			};
			logger.trace(`Updating owner index for the account with address ${owner.address}.`);
			await ownersTable.upsert(info, dbTrx);
			logger.debug(`Updated owner index for the account with address ${owner.address}.`);
			return true;
		},
		{ concurrency: audioStreamedData.owners.length },
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

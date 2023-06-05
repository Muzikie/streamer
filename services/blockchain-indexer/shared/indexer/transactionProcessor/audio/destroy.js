const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const audiosTableSchema = require('../../../database/schema/audios');
const ownersTableSchema = require('../../../database/schema/owners');
const featsTableSchema = require('../../../database/schema/feats');

const {
	MODULE_NAME_AUDIO,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getAudiosTable = () => getTableInstance(
	audiosTableSchema.tableName,
	audiosTableSchema,
	MYSQL_ENDPOINT,
);

const getOwnersTable = () => getTableInstance(
	ownersTableSchema.tableName,
	ownersTableSchema,
	MYSQL_ENDPOINT,
);

const getFeatsTable = () => getTableInstance(
	featsTableSchema.tableName,
	featsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'destroy';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const { data: commandExecutedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_COMMAND_EXECUTION_RESULT,
	);
	if (!commandExecutedData.success) {
		return false;
	}

	const { audioID } = tx.params;

	const audiosTable = await getAudiosTable();
	const ownersTable = await getOwnersTable();
	const featsTable = await getFeatsTable();

	logger.trace(`Removing audio index for the audio with ID ${audioID}.`);
	await audiosTable.delete({ audioID }, dbTrx);
	logger.trace(`Removed audio index for the audio with ID ${audioID}.`);

	logger.trace(`Removing owners index for the audio with ID ${audioID}.`);
	await ownersTable.delete({ audioID }, dbTrx);
	logger.trace(`Removed owners index for the audio with ID ${audioID}.`);

	logger.trace(`Removing feats index for the audio with ID ${audioID}.`);
	await featsTable.delete({ audioID }, dbTrx);
	logger.trace(`Removed feats index for the audio with ID ${audioID}.`);

	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

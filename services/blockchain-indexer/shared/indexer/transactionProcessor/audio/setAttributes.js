const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const audiosTableSchema = require('../../../database/schema/audios');
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

const getFitsTable = () => getTableInstance(
	featsTableSchema.tableName,
	featsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'setAttributes';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	// Do not process failed transactions
	const { data: commandExecutedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_COMMAND_EXECUTION_RESULT,
	);
	if (!commandExecutedData.success) {
		return false;
	}

	const audiosTable = await getAudiosTable();
	const featsTable = await getFitsTable();

	const { audioID } = tx.params;

	// Find the audio to process
	const [audio] = await audiosTable.find(
		{ audioID },
		['name', 'releaseYear', 'collectionID', 'creatorAddress'],
		dbTrx,
	);
	const oldFeats = await featsTable.find(
		{ audioID },
		['address'],
		dbTrx,
	);
	const oldFeatsAddresses = oldFeats.map(({ address }) => address);

	// Define removed and added feats
	const removedFeats = oldFeatsAddresses.filter(
		address => !tx.params.feat.includes(address),
	);
	const addedFeats = tx.params.feat.filter(
		address => !oldFeatsAddresses.includes(address),
	);

	// Store new feats
	await BluebirdPromise.map(
		addedFeats,
		async address => {
			const featInfo = {
				address,
				role: 'co-artist', // TODO: get role from tx.params.feat
				audioID,
			};
			logger.trace(`Updating feats index for the account with address ${address}.`);
			await featsTable.upsert(featInfo, dbTrx);
			logger.debug(`Updated feats index for the account with address ${address}.`);
			return true;
		},
		{ concurrency: tx.params.feat.length },
	);

	// Remove old feats
	await BluebirdPromise.map(
		removedFeats,
		async address => {
			logger.trace(`Updating feats index for the account with address ${address}.`);
			await featsTable.delete({ address, audioID }, dbTrx);
			logger.debug(`Updated feats index for the account with address ${address}.`);
			return true;
		},
		{ concurrency: tx.params.feat.length },
	);

	logger.trace(`Updating audio with ID ${audioID}.`);
	const audiosNFT = {
		...audio,
		...tx.params,
	};

	await audiosTable.upsert(audiosNFT, dbTrx);
	logger.debug(`Updated audio with ID ${audioID}.`);
	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

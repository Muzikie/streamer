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
	const audiosTable = await getAudiosTable();
	const featsTable = await getFitsTable();

	const audio = await audiosTable.find(
		{ audioID: tx.params.audioID },
		['name', 'releaseYear', 'collectionID', 'creatorAddress'],
		dbTrx,
	);

	// Insert feats
	await BluebirdPromise.map(
		tx.params.feat,
		async feat => {
			const featInfo = {
				address: feat,
				role: 'co-artist', // TODO: get role from tx.params.feat
				audioID: tx.params.audioID,
			};
			logger.trace(`Updating feats index for the account with address ${feat}.`);
			await featsTable.upsert(featInfo, dbTrx);
			logger.debug(`Updated feats index for the account with address ${feat}.`);
			return true;
		},
		{ concurrency: tx.params.feat.length },
	);

	logger.trace(`Updating audio with ID ${tx.params.audioID}.`);
	const audiosNFT = {
		...audio,
		...tx.params,
	};

	await audiosTable.upsert(audiosNFT, dbTrx);
	logger.debug(`Updated audio with ID ${tx.params.audioID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

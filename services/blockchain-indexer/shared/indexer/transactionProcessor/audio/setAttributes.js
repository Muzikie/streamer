const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const audiosTableSchema = require('../../../database/schema/audios');
const fitsTableSchema = require('../../../database/schema/fits');

const getAudiosTable = () => getTableInstance(
	audiosTableSchema.tableName,
	audiosTableSchema,
	MYSQL_ENDPOINT,
);

const getFitsTable = () => getTableInstance(
	fitsTableSchema.tableName,
	fitsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const audiosTable = await getAudiosTable();
	const fitsTable = await getFitsTable();

	const audio = await audiosTable.find(
		{ audioID: tx.params.audioID },
		['name', 'releaseYear', 'collectionID', 'creatorAddress'],
		dbTrx,
	);

	// Insert fits
	await BluebirdPromise.map(
		tx.params.fit,
		async fit => {
			const fitInfo = {
				address: fit,
				role: 'co-artist', // TODO: get role from tx.params.fit
				audioID: tx.params.audioID,
			};
			logger.trace(`Updating fits index for the account with address ${fit}.`);
			await fitsTable.upsert(fitInfo, dbTrx);
			logger.debug(`Updated fits index for the account with address ${fit}.`);
			return true;
		},
		{ concurrency: tx.params.fit.length },
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

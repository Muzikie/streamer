const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const accountsTableSchema = require('../../../database/schema/accounts');
const audiosTableSchema = require('../../../database/schema/audios');
const ownersTableSchema = require('../../../database/schema/owners');
const fitsTableSchema = require('../../../database/schema/fits');
const {
	MODULE_NAME_AUDIO,
	EVENT_NAME_AUDIO_CREATED,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT,
);

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

const getFitsTable = () => getTableInstance(
	fitsTableSchema.tableName,
	fitsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const audiosTable = await getAudiosTable();
	const ownersTable = await getOwnersTable();
	const fitsTable = await getFitsTable();

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);

	const account = {
		address: senderAddress,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	const { data: eventData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_AUDIO_CREATED,
	);

	// Insert owners
	await BluebirdPromise.map(
		tx.params.owners,
		async owner => {
			const ownerInfo = {
				...owner,
				audioID: eventData.audioID,
				nonce: tx.nonce,
				shares: 0,
			};
			logger.trace(`Updating owner index for the account with address ${owner.address}.`);
			await ownersTable.upsert(ownerInfo, dbTrx);
			logger.debug(`Updated owner index for the account with address ${owner.address}.`);
			return true;
		},
		{ concurrency: tx.params.owners.length },
	);

	// Insert fits
	await BluebirdPromise.map(
		tx.params.fit,
		async fit => {
			const fitInfo = {
				address: fit,
				role: 'co-artist', // TODO: get role from tx.params.fit
				audioID: eventData.audioID,
			};
			logger.trace(`Updating fits index for the account with address ${fit}.`);
			await fitsTable.upsert(fitInfo, dbTrx);
			logger.debug(`Updated fits index for the account with address ${fit}.`);
			return true;
		},
		{ concurrency: tx.params.fit.length },
	);

	logger.trace(`Updating owners index for the audio with audioID ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing audios with address ${account.address}.`);

	const audiosNFT = {
		...eventData,
		...tx.params,
	};

	await audiosTable.upsert(audiosNFT, dbTrx);
	logger.debug(`Indexed audio with ID ${eventData.audiosID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const audiosTable = await getAudiosTable();
	const ownersTable = await getOwnersTable();

	const { data: eventData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_AUDIO_CREATED,
	);

	logger.trace(`Deleting owners corresponding the audio ID ${eventData.audioID}.`);
	await ownersTable.delete({ audioID: eventData.audioID }, dbTrx);
	logger.trace(`Deleted owners corresponding the audio ID ${eventData.audioID}.`);

	logger.trace(`Removing audio entry for ID ${eventData.audioID}.`);
	await audiosTable.deleteByPrimaryKey(eventData.audioID, dbTrx);
	logger.debug(`Removed audio entry for ID ${eventData.audioID}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

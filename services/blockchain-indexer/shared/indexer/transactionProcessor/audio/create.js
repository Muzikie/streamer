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
const featsTableSchema = require('../../../database/schema/feats');
const {
	MODULE_NAME_AUDIO,
	EVENT_NAME_AUDIO_CREATED,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
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

const getFeatsTable = () => getTableInstance(
	featsTableSchema.tableName,
	featsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

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

	const accountsTable = await getAccountsTable();
	const audiosTable = await getAudiosTable();
	const ownersTable = await getOwnersTable();
	const featsTable = await getFeatsTable();

	// Use event data to get audioID
	const { data: audioCreatedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_AUDIO_CREATED,
	);

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);

	// Store a record of the sender account
	const account = {
		address: senderAddress,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	// Store owners
	await BluebirdPromise.map(
		tx.params.owners,
		async owner => {
			const memberInfo = {
				...owner,
				audioID: audioCreatedData.audioID,
			};
			logger.trace(`Updating owner index for the account with address ${owner.address}.`);
			await ownersTable.upsert(memberInfo, dbTrx);
			logger.debug(`Updated owner index for the account with address ${owner.address}.`);
			return true;
		},
		{ concurrency: tx.params.owners.length },
	);

	// Store feats
	await BluebirdPromise.map(
		tx.params.feat,
		async feat => {
			const featInfo = {
				address: feat,
				role: 'co-artist',
				audioID: audioCreatedData.audioID,
			};
			logger.trace(`Updating feats index for the account with address ${feat}.`);
			await featsTable.upsert(featInfo, dbTrx);
			logger.debug(`Updated feats index for the account with address ${feat}.`);
			return true;
		},
		{ concurrency: tx.params.feat.length },
	);

	logger.trace(`Updating owners index for the audio with audioID ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing audios with address ${account.address}.`);

	// And finally, store the audio
	const audiosNFT = {
		...audioCreatedData,
		...tx.params,
	};

	await audiosTable.upsert(audiosNFT, dbTrx);
	logger.debug(`Indexed audio with ID ${audioCreatedData.audiosID}.`);
	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const audiosTable = await getAudiosTable();
	const ownersTable = await getOwnersTable();
	const featsTable = await getFeatsTable();

	const { data: audioCreatedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_AUDIO_CREATED,
	);

	logger.trace(`Deleting owners corresponding the audio ID ${audioCreatedData.audioID}.`);
	await ownersTable.delete({ audioID: audioCreatedData.audioID }, dbTrx);
	logger.trace(`Deleted owners corresponding the audio ID ${audioCreatedData.audioID}.`);

	logger.trace(`Deleting feats corresponding the audio ID ${audioCreatedData.audioID}.`);
	await featsTable.delete({ audioID: audioCreatedData.audioID }, dbTrx);
	logger.trace(`Deleted feats corresponding the audio ID ${audioCreatedData.audioID}.`);

	logger.trace(`Removing audio entry for ID ${audioCreatedData.audioID}.`);
	await audiosTable.deleteByPrimaryKey(audioCreatedData.audioID, dbTrx);
	logger.debug(`Removed audio entry for ID ${audioCreatedData.audioID}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

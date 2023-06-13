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
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
	EVENT_NAME_AUDIO_INCOME_RECLAIMED,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getOwnersTable = () => getTableInstance(
	ownersTableSchema.tableName,
	ownersTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'reclaim';

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

	// Use event data to get audioID
	const eventData = events.find(
		({ module, name }) => module === MODULE_NAME_AUDIO
			&& name === EVENT_NAME_AUDIO_INCOME_RECLAIMED,
	);
	const { data: audioIncomeReclaimedData } = eventData || { data: { claimData: { audioIDs: [] } } };

	await BluebirdPromise.map(
		audioIncomeReclaimedData.claimData.audioIDs,
		async audioID => {
			const owners = await ownersTable.find({ audioID }, ['address', 'shares', 'income'], dbTrx);
			const sender = owners.find(owner => owner.address === tx.senderAddress);
			const info = {
				...sender,
				audioID,
				income: 0,
			};
			logger.trace(`Updating owner index for the account with address ${sender.address} and audioID: ${audioID}.`);
			await ownersTable.upsert(info, dbTrx);
			logger.debug(`Updated owner index for the account with address ${sender.address} and audioID: ${audioID}.`);
			return true;
		},
		{ concurrency: audioIncomeReclaimedData.claimData.audioIDs.length },
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

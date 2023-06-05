const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const ownersTableSchema = require('../../../database/schema/owners');

const {
	MODULE_NAME_AUDIO,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getOwnersTable = () => getTableInstance(
	ownersTableSchema.tableName,
	ownersTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'transfer';

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

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
	const {
		audioID,
		address: recipientAddress,
		shares: transferredShares,
	} = tx.params;

	const [sender] = await ownersTable.find({ audioID, address: senderAddress }, ['address', 'audioID', 'shares', 'income'], dbTrx);
	let [recipient] = await ownersTable.find({ audioID, address: recipientAddress }, ['address', 'audioID', 'shares', 'income'], dbTrx);

	// Transfer the shares
	logger.trace(`Updating owner index for the account with address ${senderAddress}.`);
	sender.shares -= transferredShares;
	if (sender.shares === 0) {
		await ownersTable.delete({ audioID: tx.params.audioID, address: senderAddress }, dbTrx);
	} else {
		await ownersTable.upsert(sender, dbTrx);
	}

	logger.debug(`Updated owner index for the account with address ${senderAddress}.`);

	logger.trace(`Updating owner index for the account with address ${recipientAddress}.`);
	if (recipient) {
		recipient.shares += transferredShares;
	} else {
		recipient = {
			audioID,
			address: recipientAddress,
			shares: transferredShares,
		};
	}
	await ownersTable.upsert(recipient, dbTrx);
	logger.debug(`Updated owner index for the account with address ${recipientAddress}.`);
	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

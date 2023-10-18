const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');
const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const votesTableSchema = require('../../../database/schema/votes');

const {
	MODULE_NAME_ANCHOR,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getVotesTable = () => getTableInstance(
	votesTableSchema.tableName,
	votesTableSchema,
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

	const votesTable = await getVotesTable();

	const { anchorID } = tx.params;

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
	const vote = {
		senderAddress,
		anchorID,
	};

	logger.trace(`Indexing vote with anchor ID ${anchorID} and sender address ${senderAddress}.`);
	await votesTable.upsert(vote, dbTrx);
	logger.debug(`Indexed vote with transaction ID ${dbTrx.id}.`);

	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../../../config');
const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const votesTableSchema = require('../../../database/schema/votes');
const anchorsTableSchema = require('../../../database/schema/anchors');
const badgesTableSchema = require('../../../database/schema/badges');

const {
	MODULE_NAME_ANCHOR,
	EVENT_NAME_ANCHOR_VOTED,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getVotesTable = () => getTableInstance(
	votesTableSchema.tableName,
	votesTableSchema,
	MYSQL_ENDPOINT,
);

const getAnchorsTable = () => getTableInstance(
	anchorsTableSchema.tableName,
	anchorsTableSchema,
	MYSQL_ENDPOINT,
);

const getBadgesTable = () => getTableInstance(
	badgesTableSchema.tableName,
	badgesTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'vote';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	// Do not process failed transactions
	const { data: commandExecutedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_COMMAND_EXECUTION_RESULT,
	);
	if (!commandExecutedData.success) {
		return false;
	}

	const eventData = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_ANCHOR_VOTED,
	);
	const { data: anchorVotedData } = eventData || { data: {} };

	const votesTable = await getVotesTable();
	const anchorsTable = await getAnchorsTable();
	const badgesTable = await getBadgesTable();

	const { anchorID } = tx.params;

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
	const vote = {
		senderAddress,
		anchorID,
	};

	logger.trace(`Indexing vote with anchor ID ${anchorID} and sender address ${senderAddress}.`);
	await votesTable.upsert(vote, dbTrx);
	logger.debug(`Indexed vote with transaction ID ${dbTrx.id}.`);

	const [anchor] = await anchorsTable.find(
		{ anchorID },
		['createdAt'],
		dbTrx);
	await BluebirdPromise.map(
		anchorVotedData.updatedWinners,
		async (winner, index) => {
			const { anchorID: winningAnchorID, awardedTo, prize } = winner;
			const [badge] = await badgesTable.find(
				{ awardDate: anchor.createdAt, rank: index + 1 },
				['badgeID', 'anchorID', 'awardedTo', 'type', 'awardDate', 'rank', 'prize', 'claimed'],
				dbTrx,
			);

			badge.anchorID = winningAnchorID;
			badge.awardedTo = awardedTo;
			badge.prize = prize;

			await badgesTable.upsert(badge, dbTrx);
		},
		{ concurrency: anchorVotedData.updatedWinners.length });
	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

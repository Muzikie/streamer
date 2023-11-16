const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const badgesTableSchema = require('../../../database/schema/badges');

const {
	MODULE_NAME_BADGE,
	EVENT_NAME_BADGE_CREATED,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getBadgesTable = () => getTableInstance(
	badgesTableSchema.tableName,
	badgesTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (_blockHeader, tx, events, dbTrx) => {
	const badgesTable = await getBadgesTable();

	// @todo make sure the process won't break if the event doesn't exist. e.g. do not index.
	const { data: eventData = {} } = events.find(
		(e) => e.module === MODULE_NAME_BADGE && e.name === EVENT_NAME_BADGE_CREATED,
	);

	const badgesNFT = {
		...eventData,
		...tx.params,
		claimed: false,
	};

	logger.debug(`Indexing badge with ID ${eventData.badgeID}.`);
	await badgesTable.upsert(badgesNFT, dbTrx);
	logger.debug(`Indexed badge with ID ${eventData.badgeID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (_blockHeader, _tx, events, dbTrx) => {
	const badgesTable = await getBadgesTable();

	const { data: eventData } = events.find(
		(e) => e.module === MODULE_NAME_BADGE && e.name === EVENT_NAME_BADGE_CREATED,
	);

	logger.trace(`Remove badge entry for ID ${eventData.badgeID}.`);
	await badgesTable.delete({ badgeID: eventData.badgeID }, dbTrx);
	logger.debug(`Removed badge entry for ID ${eventData.badgeID}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const accountsTableSchema = require('../../../database/schema/accounts');
const badgesTableSchema = require('../../../database/schema/badges');

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT,
);

const getBadgesTable = () => getTableInstance(
	badgesTableSchema.tableName,
	badgesTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'claim';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (_blockHeader, tx, _events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const badgesTable = await getBadgesTable();

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
	const { badgeID } = tx.params;

	logger.trace(`Indexing badge with address ${badgeID} updated by transaction with ID ${dbTrx.id}.`);
	const [badgeNFT] = await badgesTable.find(
		{ badgeID },
		['badgeID', 'anchorID', 'awardedTo', 'type', 'awardDate', 'rank', 'prize', 'claimed'],
		dbTrx,
	);
	badgeNFT.claimed = true;
	await badgesTable.upsert(badgeNFT, dbTrx);
	logger.debug(`Indexed transaction with ID ${dbTrx.id}.`);

	// Update sender in accounts table
	const senderAccount = { address: senderAddress };
	await accountsTable.upsert(senderAccount, dbTrx);
	logger.trace(`Indexed badge purchase with account address ${senderAddress}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (_blockHeader, tx, _events, dbTrx) => {
	const badgesTable = await getBadgesTable();

	const { badgeID } = tx.params;

	const badgeNFT = await badgesTable.find(
		{ badgeID },
		['badgeID', 'anchorID', 'awardedTo', 'type', 'awardDate', 'rank', 'prize', 'claimed'],
		dbTrx,
	);
	badgeNFT.claimed = false;
	await badgesTable.upsert(badgeNFT, dbTrx);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const membersTableSchema = require('../../../database/schema/members');

const getMembersTable = () => getTableInstance(
	membersTableSchema.tableName,
	membersTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'updateMembers';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const membersTable = await getMembersTable();

	const { subscriptionID } = tx.params;

	logger.trace(`Removing existing members with subscription ID ${subscriptionID}.`);
	const currentMembers = await membersTable.find(
		{ shared: subscriptionID, removedBy: null },
		['id', 'address', 'shared'],
		dbTrx,
	);

	const currentAddresses = currentMembers.map(({ address }) => address);
	const removed = currentMembers.filter(({ address }) => !tx.params.members.includes(address));
	const added = tx.params.members.filter(member => !currentAddresses.includes(member));

	await BluebirdPromise.map(
		removed,
		async member => {
			const memberData = {
				...member,
				removedBy: tx.id,
			};
			logger.trace(`Updating account index for the account with address ${member}.`);
			await membersTable.upsert(memberData, dbTrx);
			logger.debug(`Updated account index for the account with address ${member}.`);
		},
		{ concurrency: removed.length },
	);
	logger.trace(`Removed existing members with subscription ID ${subscriptionID}.`);

	logger.trace(`Adding new members with subscription ID ${subscriptionID}.`);
	await BluebirdPromise.map(
		added,
		async member => {
			const memberData = {
				id: member.concat(`-${tx.nonce.toString()}`),
				address: member,
				addedBy: tx.id,
				shared: subscriptionID,
			};
			logger.trace(`Updating account index for the account with address ${member}.`);
			await membersTable.upsert(memberData, dbTrx);
			logger.debug(`Updated account index for the account with address ${member}.`);
		},
		{ concurrency: added.length },
	);
	logger.trace(`Added new members with subscription ID ${subscriptionID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const membersTable = await getMembersTable();

	const removed = await membersTable.find(
		{ removedBy: tx.id },
		['id', 'address', 'shared'],
		dbTrx,
	);

	await membersTable.delete({ addedBy: tx.id }, dbTrx);

	await BluebirdPromise.map(
		removed,
		async member => {
			const memberData = {
				...member,
				removedBy: null,
			};
			logger.trace(`Updating account index for the account with address ${member}.`);
			await membersTable.upsert(memberData, dbTrx);
			logger.debug(`Updated account index for the account with address ${member}.`);
		},
		{ concurrency: removed.length },
	);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

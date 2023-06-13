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
const profilesTableSchema = require('../../../database/schema/profiles');
const socialAccountsTableSchema = require('../../../database/schema/socialAccounts');

const {
	MODULE_NAME_PROFILE,
	EVENT_NAME_PROFILE_CREATED,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT,
);

const getProfilesTable = () => getTableInstance(
	profilesTableSchema.tableName,
	profilesTableSchema,
	MYSQL_ENDPOINT,
);

const getSocialAccountsTable = () => getTableInstance(
	socialAccountsTableSchema.tableName,
	socialAccountsTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const profilesTable = await getProfilesTable();
	const socialAccountsTable = await getSocialAccountsTable();
	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);

	const account = {
		address: senderAddress,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing profiles with address ${account.address}.`);

	const { data: eventData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_PROFILE
			&& name === EVENT_NAME_PROFILE_CREATED,
	);

	const profile = {
		...eventData,
		...tx.params,
	};

	await BluebirdPromise.map(
		tx.params.socialAccounts,
		async socialAccount => {
			const socialInfo = {
				profileID: eventData.profileID,
				username: socialAccount.username,
				platform: socialAccount.platform,
			};
			logger.trace(`Inserting social sccounts for the profile with ID ${eventData.profileID}.`);
			await socialAccountsTable.upsert(socialInfo, dbTrx);
			logger.debug(`Inserted social sccounts for the profile with ID ${eventData.profileID}.`);
			return true;
		},
		{ concurrency: tx.params.socialAccounts.length },
	);

	await profilesTable.upsert(profile, dbTrx);
	logger.debug(`Indexed profile with ID ${eventData.profileID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

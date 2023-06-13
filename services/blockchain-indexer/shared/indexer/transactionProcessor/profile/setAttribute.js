const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');
const config = require('../../../../config');
const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const profilesTableSchema = require('../../../database/schema/profiles');
const socialAccountsTableSchema = require('../../../database/schema/socialAccounts');

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
const COMMAND_NAME = 'setAttributes';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const profilesTable = await getProfilesTable();
	const socialAccountsTable = await getSocialAccountsTable();
	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);

	const account = {
		address: senderAddress,
	};

	logger.trace(`Indexing profiles with address ${account.address}.`);
	const [existingProfile] = await profilesTable.find(
		{ profileID: tx.params.profileID },
		['profileID', 'name', 'nickName', 'description', 'avatarHash', 'avatarSignature', 'bannerHash', 'bannerSignature', 'creatorAddress'],
		dbTrx,
	);
	if (!existingProfile) {
		throw new Error(`Profile with ID ${tx.params.profileID} does not exist.`);
	}

	const newProfile = {
		...tx.params,
		profileID: existingProfile.profileID,
		creatorAddress: existingProfile.creatorAddress,
	};

	// Delete existing social account records
	await socialAccountsTable.delete({ profileID: existingProfile.profileID }, dbTrx);

	// Insert new social account records
	await BluebirdPromise.map(
		tx.params.socialAccounts,
		async (socialAccount) => {
			const socialInfo = {
				profileID: existingProfile.profileID,
				username: socialAccount.username,
				platform: socialAccount.platform,
			};
			logger.trace(`Updating social accounts for the profile with ID ${existingProfile.profileID}.`);
			await socialAccountsTable.upsert(socialInfo, dbTrx);
			logger.debug(`Updating social accounts for the profile with ID ${existingProfile.profileID}.`);
			return true;
		},
		{ concurrency: tx.params.socialAccounts.length },
	);

	// Update the profile record
	await profilesTable.upsert(newProfile, dbTrx);
	logger.debug(`Updated profile with ID ${existingProfile.profileID}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

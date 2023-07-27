const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');
const transactionsIndexSchema = require('../../database/schema/profiles');
const socialAccountsIndexSchema = require('../../database/schema/socialAccounts');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getProfilesIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getSocialAccountsIndex = () => getTableInstance(
	socialAccountsIndexSchema.tableName,
	socialAccountsIndexSchema,
	MYSQL_ENDPOINT,
);

const getProfiles = async (params = {}) => {
	const profilesTable = await getProfilesIndex();

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'name',
			pattern: search,
		};
	}

	const total = await profilesTable.count(params);
	const profilesData = await profilesTable.find(
		{ ...params, limit: params.limit || 10 },
		['profileID', 'name', 'nickName', 'description', 'creatorAddress', 'avatarHash', 'avatarSignature', 'bannerHash', 'bannerSignature'],
	);
	const socialAccountsTable = await getSocialAccountsIndex();

	const data = await BluebirdPromise.map(
		profilesData,
		async (profile) => {
			const socialData = await socialAccountsTable.find(
				{ profileID: profile.profileID },
				['profileID', 'username', 'platform'],
			);

			return {
				...profile,
				socialAccounts: socialData,
			};
		},
		{ concurrency: profilesData.length },
	);

	const result = {
		data,
		meta: {
			count: data.length,
			offset: parseInt(params.offset, 10) || 0,
			total,
		},
	};
	return result;
};

module.exports = {
	getProfiles,
};

const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const transactionsIndexSchema = require('../../database/schema/profiles');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getProfilesIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getProfiles = async (params = {}) => {
	const profilesTable = await getProfilesIndex();
	const total = await profilesTable.count(params);
	const resultSet = await profilesTable.find(
		{ ...params, limit: params.limit || 10 },
		['profileID', 'name', 'nickName', 'description', 'socialAccounts', 'creatorAddress'],
	);

	const result = {
		data: resultSet,
		meta: {
			count: resultSet.length,
			offset: parseInt(params.offset, 10) || 0,
			total,
		},
	};
	return result;
};

module.exports = {
	getProfiles,
};

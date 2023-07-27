const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const transactionsIndexSchema = require('../../database/schema/collections');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getCollectionsIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getCollections = async (params = {}) => {
	const collectionsTable = await getCollectionsIndex();

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'name',
			pattern: search,
		};
	}

	const total = await collectionsTable.count(params);
	const resultSet = await collectionsTable.find(
		{ ...params, limit: params.limit || 10 },
		['collectionID', 'creatorAddress', 'name', 'releaseYear', 'collectionType'],
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
	getCollections,
};

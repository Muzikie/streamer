const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const transactionsIndexSchema = require('../../database/schema/subscriptions');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getSubscriptionsIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getSubscriptions = async (params = {}) => {
	const subscriptionsTable = await getSubscriptionsIndex();

	const total = await subscriptionsTable.count(params);
	const resultSet = await subscriptionsTable.find(
		{ ...params, limit: params.limit || total },
		['subscriptionID', 'creatorAddress', 'price', 'consumable', 'maxMembers', 'streams'],
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
	getSubscriptions,
};

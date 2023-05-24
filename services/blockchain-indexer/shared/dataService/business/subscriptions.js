const {
	MySQL: { getTableInstance },
	Logger,
} = require('lisk-service-framework');
const transactionsIndexSchema = require('../../database/schema/subscriptions');
const config = require('../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getSubscriptionsIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getSubscriptions = async (params = {}) => {
	const subscriptionsTable = await getSubscriptionsIndex();
	logger.info('ALI: instantiating the table');

	const total = await subscriptionsTable.count(params);
	logger.info(`ALI: got the total: ${total}`);
	const resultSet = await subscriptionsTable.find(
		{ ...params, limit: params.limit || total },
		['subscriptionID', 'creatorAddress', 'price', 'consumable', 'maxMembers', 'streams'],
	);
	logger.info(`ALI: got the result ${resultSet.length}`);

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

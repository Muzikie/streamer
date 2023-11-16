const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const badgesIndexSchema = require('../../database/schema/badges');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getBadgesIndex = () => getTableInstance(
	badgesIndexSchema.tableName,
	badgesIndexSchema,
	MYSQL_ENDPOINT,
);

const getBadges = async (params = {}) => {
	const badgesTable = await getBadgesIndex();

	const total = await badgesTable.count(params);
	const data = await badgesTable.find(
		{ ...params, limit: params.limit || 10 },
		['badgeID', 'anchorID', 'awardedTo', 'awardDate', 'type', 'prize', 'rank', 'claimed'],
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
	getBadges,
};

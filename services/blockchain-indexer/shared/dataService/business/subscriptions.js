const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const transactionsIndexSchema = require('../../database/schema/subscriptions');
const membersIndexSchema = require('../../database/schema/members');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getSubscriptionsIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getMembersIndex = () => getTableInstance(
	membersIndexSchema.tableName,
	membersIndexSchema,
	MYSQL_ENDPOINT,
);
const getActiveSubscriptionsByMemberAddress = async (params = {}) => {
	const membersTable = await getMembersIndex();
	const subscriptionsTable = await getSubscriptionsIndex();
	const result = {
		data: {},
		meta: {
			count: 0,
			offset: parseInt(params.offset, 10) || 0,
			total: 0,
		},
	};
	try {
		const member = await membersTable.find(
			{ address: params.memberAddress },
			['id', 'address', 'shared', 'addedBy', 'removedBy'],
		);
		if (member) {
			const data = await subscriptionsTable.find(
				{ subscriptionID: member[0].shared },
				['subscriptionID', 'creatorAddress', 'price', 'consumable', 'maxMembers', 'streams'],
			);
			if (data) {
				return {
					data,
					meta: {
						count: 1,
						offset: parseInt(params.offset, 10) || 0,
						total: 1,
					},
				};
			}
		}
		return result;
	} catch (error) {
		return {
			data: {},
			meta: {
				count: 0,
				offset: parseInt(params.offset, 10) || 0,
				total: 0,
			},
		};
	}
};

const getSubscriptionsBySubscriptionIdOrCreatorAddress = async (params = {}) => {
	const subscriptionsTable = await getSubscriptionsIndex();
	const membersTable = await getMembersIndex();

	const total = await subscriptionsTable.count(params);
	const subscriptionSet = await subscriptionsTable.find(
		{ ...params, limit: params.limit || total },
		['subscriptionID', 'creatorAddress', 'price', 'consumable', 'maxMembers', 'streams'],
	);

	const data = await BluebirdPromise.map(
		subscriptionSet,
		async subscription => {
			const membersSet = await membersTable.find(
				{ shared: subscription.subscriptionID, removedBy: null },
				['address'],
			);
			subscription.members = membersSet.map(member => ({ address: member.address }));
			return subscription;
		},
		{ concurrency: subscriptionSet.length },
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

const getSubscriptions = async (params = {}) => {
	if (params.memberAddress) {
		return getActiveSubscriptionsByMemberAddress(params);
	}
	return getSubscriptionsBySubscriptionIdOrCreatorAddress(params);
};

module.exports = {
	getSubscriptions,
};

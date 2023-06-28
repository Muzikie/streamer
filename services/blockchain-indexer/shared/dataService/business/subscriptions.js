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
const getActiveSubscriptionsForMember = async (params = {}) => {
	const membersTable = await getMembersIndex();
	const subscriptionsTable = await getSubscriptionsIndex();

	// Find rows [project on 'shared' field] that has address == memberAddress && removedBy == null
	const total = await subscriptionsTable.count(params);
	const members = await membersTable.find(
		{ ...params, limit: params.limit || total },
		// ['subscriptionID', 'creatorAddress', 'price', 'consumable', 'maxMembers', 'streams'],
		['id', 'address', 'shared', 'addedBy', 'removedBy'],
	);
	// We assume that member is always on just 1 active subscription
	// Find all subscriptions that (subscriptionID == 'shared')
	const data = await BluebirdPromise.map(
		members,
		async member => {
			const subscriptions = await subscriptionsTable.find(
				{ shared: member.shared }, // member[0]
				['subscriptionID', 'creatorAddress', 'price', 'consumable', 'maxMembers', 'streams'],
			);
			member.subscription = subscriptions.map(
				subscription => ({ subscriptionID: subscription.shared }));
			return member;
		},
		{ concurrency: members.length },
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
	if (params.memberAddress !== null) {
		return getActiveSubscriptionsForMember(params);
	}
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

module.exports = {
	getSubscriptions,
};

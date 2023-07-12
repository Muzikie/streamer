module.exports = {
	tableName: 'subscriptions',
	primaryKey: 'subscriptionID',
	schema: {
		subscriptionID: { type: 'string', null: true, defaultValue: null },
		creatorAddress: { type: 'string', null: true, defaultValue: null }, // at first->DEV but then->user
		price: { type: 'bigInteger', null: true, defaultValue: null },
		consumable: { type: 'bigInteger', null: true, defaultValue: null },
		streams: { type: 'bigInteger', null: true, defaultValue: null },
		maxMembers: { type: 'integer', null: true, defaultValue: null },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

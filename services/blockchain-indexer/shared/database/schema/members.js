module.exports = {
	tableName: 'members',
	primaryKey: 'id',
	schema: {
		id: { type: 'string' }, // memberAddress-nonce
		address: { type: 'string' }, // memberAddress
		shared: { type: 'string', null: true }, // subscriptionID
		addedBy: { type: 'string', null: true }, // transactionID
		removedBy: { type: 'string', null: true }, // transactionID
	},
	indexes: {
		shared: { type: 'key' },
	},
	purge: {},
};

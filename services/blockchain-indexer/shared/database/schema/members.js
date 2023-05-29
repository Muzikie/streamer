module.exports = {
	tableName: 'members',
	primaryKey: 'address',
	schema: {
		address: { type: 'string' },
		shared: { type: 'string', null: true },
	},
	indexes: {
		shared: { type: 'key' },
	},
	purge: {},
};

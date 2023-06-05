module.exports = {
	tableName: 'members',
	primaryKey: 'id',
	schema: {
		id: { type: 'string' },
		address: { type: 'string' },
		shared: { type: 'string', null: true },
		addedBy: { type: 'string', null: true },
		removedBy: { type: 'string', null: true },
	},
	indexes: {
		shared: { type: 'key' },
	},
	purge: {},
};

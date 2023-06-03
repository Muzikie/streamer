module.exports = {
	tableName: 'owners',
	primaryKey: 'id',
	schema: {
		id: { type: 'string' },
		address: { type: 'string', null: true, defaultValue: null },
		audioID: { type: 'string' },
		share: { type: 'integer', min: 1, max: 100 },
		income: { type: 'bigInteger', null: true, defaultValue: null },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

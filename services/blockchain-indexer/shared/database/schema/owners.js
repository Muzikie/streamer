module.exports = {
	tableName: 'owners',
	primaryKey: ['address', 'audioID'],
	schema: {
		address: { type: 'string' },
		audioID: { type: 'string' },
		shares: { type: 'integer' },
		income: { type: 'bigInteger', defaultValue: 0 },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

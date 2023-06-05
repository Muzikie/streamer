module.exports = {
	tableName: 'owners',
	primaryKey: ['address', 'audioID', 'nonce'],
	schema: {
		address: { type: 'string', null: true, defaultValue: null },
		audioID: { type: 'string' },
		nonce: { type: 'bigInteger', min: 0 },
		share: { type: 'integer', min: 1, max: 100 },
		income: { type: 'bigInteger', null: true, defaultValue: 0 },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

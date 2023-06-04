module.exports = {
	tableName: 'fits',
	primaryKey: ['address', 'audioID'],
	schema: {
		address: { type: 'string', null: true, defaultValue: null },
		audioID: { type: 'string' },
		role: { type: 'string', null: true, defaultValue: null },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

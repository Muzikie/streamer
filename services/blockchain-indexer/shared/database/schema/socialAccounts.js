module.exports = {
	tableName: 'socialAccounts',
	primaryKey: ['profileID', 'platform'],
	schema: {
		profileID: { type: 'string' },
		username: { type: 'string', null: true, defaultValue: null },
		platform: { type: 'string' },
	},
	indexes: {
		profileID: { type: 'string' },
	},
	purge: {},
};

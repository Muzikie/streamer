module.exports = {
	tableName: 'socialAccounts',
	primaryKey: 'profileID',
	schema: {
		profileID: { type: 'string' },
		username: { type: 'string', null: true, defaultValue: null },
		platform: { type: 'string', null: true, defaultValue: null },
	},
	indexes: {
		profileID: { type: 'string' },
	},
	purge: {},
};

module.exports = {
	tableName: 'profiles',
	primaryKey: 'profileID',
	schema: {
		name: { type: 'string', null: true, defaultValue: null },
		nickName: { type: 'string', null: true, defaultValue: null },
		description: { type: 'string', null: true, defaultValue: null },
		// socialAccounts: SocialAccount[];
		socialAccounts: [{
			username: { type: 'string', null: true, defaultValue: null },
			platform: { type: 'integer', null: true, defaultValue: null },
		}],
		avatarHash: { type: 'string', null: true, defaultValue: null },
		avatarSignature: { type: 'string', null: true, defaultValue: null },
		bannerHash: { type: 'string', null: true, defaultValue: null },
		bannerSignature: { type: 'string', null: true, defaultValue: null },
		// @TODO: creationDate: { type: 'string', null: true, defaultValue: null },
		creatorAddress: { type: 'string', null: true, defaultValue: null },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

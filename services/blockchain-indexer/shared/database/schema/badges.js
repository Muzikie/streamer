module.exports = {
	tableName: 'badges',
	primaryKey: 'badgeID',
	schema: {
		badgeID: { type: 'string', null: true, defaultValue: null },
		anchorID: { type: 'string', null: true, defaultValue: null },
		awardedTo: { type: 'string', null: true, defaultValue: null },
		awardDate: { type: 'string', null: true, defaultValue: null },
		type: { type: 'string', null: true, defaultValue: null },
		rank: { type: 'bigInteger', null: true, defaultValue: null },
		prize: { type: 'bigInteger', null: true, defaultValue: null },
		claimed: { type: 'boolean', null: true, defaultValue: null },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

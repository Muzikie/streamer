module.exports = {
	tableName: 'votes',
	primaryKey: ['anchorID', 'senderAddress'],
	schema: {
		anchorID: { type: 'string' },
		senderAddress: { type: 'string' },
	},
	indexes: {
		anchorID: { type: 'string' },
		senderAddress: { type: 'string' },
	},
	purge: {},
};

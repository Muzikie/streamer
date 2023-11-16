module.exports = {
	tableName: 'images',
	primaryKey: ['url', 'anchorID'],
	schema: {
		url: { type: 'string' },
		anchorID: { type: 'string' },
		width: { type: 'integer' },
		height: { type: 'integer' },
	},
	indexes: {
		anchorID: { type: 'string' },
	},
	purge: {},
};

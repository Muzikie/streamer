module.exports = {
	tableName: 'anchors',
	primaryKey: 'anchorID',
	schema: {
		anchorID: { type: 'string' },
		name: { type: 'string' },
		album: { type: 'string' },
		artists: { type: 'string' },
		spotifyId: { type: 'string' },
		appleMusicId: { type: 'string' },
		submitter: { type: 'string' },
		createdAt: { type: 'string' },
	},
	indexes: {
		submitter: { type: 'string' },
		anchorID: { type: 'string' },
	},
	purge: {},
};

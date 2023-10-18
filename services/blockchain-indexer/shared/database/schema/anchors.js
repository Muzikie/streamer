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
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

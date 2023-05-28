module.exports = {
	tableName: 'collections',
	primaryKey: 'collectionID',
	schema: {
		collectionID: { type: 'string', null: true, defaultValue: null },
		name: { type: 'string', null: true, defaultValue: null },
		releaseYear: { type: 'string', null: true, defaultValue: null },
		collectionType: { type: 'uint32', null: true, defaultValue: null },
		audios: { type: 'array', null: true, defaultValue: null },
		coverSignature: { type: 'bytes', null: true, defaultValue: null },
		coverHash: { type: 'bytes', null: true, defaultValue: null },
		creatorAddress: { type: 'string', null: true, defaultValue: null },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

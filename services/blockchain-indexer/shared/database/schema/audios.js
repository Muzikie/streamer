module.exports = {
	tableName: 'audios',
	primaryKey: 'audioID',
	schema: {
		audioID: { type: 'string' },
		name: { type: 'string', null: true, defaultValue: null },
		releaseYear: { type: 'string', null: true, defaultValue: null },
		collectionID: { type: 'string' },
		audioSignature: { type: 'string', null: true, defaultValue: null },
		coverHash: { type: 'string', null: true, defaultValue: null },
		creatorAddress: { type: 'string' },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

//   genre: number[];
//   fit: Buffer[];

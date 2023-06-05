module.exports = {
	tableName: 'audios',
	primaryKey: 'audioID',
	schema: {
		audioID: { type: 'string' },
		name: { type: 'string' },
		releaseYear: { type: 'string' },
		collectionID: { type: 'string' },
		audioSignature: { type: 'string' },
		audioHash: { type: 'string' },
		creatorAddress: { type: 'string' },
	},
	indexes: {
		creatorAddress: { type: 'string' },
	},
	purge: {},
};

//   genre: number[];
//   fit: Buffer[];

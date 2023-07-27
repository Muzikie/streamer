const audio = require('./mappings/audio');

module.exports = {
	type: 'moleculer',
	method: 'indexer.audios',
	params: {
		name: '=,string',
		audioID: '=,string',
		creatorAddress: '=,string',
		releaseYear: '=,string',
		collectionID: '=,string',
		collection: {
			collectionType: '=,string',
			releaseYear: '=,number',
			name: '=,number',
		},
		owners: ['owners', {
			address: '=,string',
			shares: '=,number',
			income: '=,number',
		}],
		feat: ['feat', {
			address: '=,string',
			name: '=,string',
			role: '=,string',
		}],
		search: '=,string',
		limit: '=,number',
		offset: '=,number',
		sort: '=,string',
		order: '=,string',
	},
	definition: {
		data: ['data', audio],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};

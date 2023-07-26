const collection = require('./mappings/collection');

module.exports = {
	type: 'moleculer',
	method: 'indexer.collections',
	params: {
		name: '=,string',
		collectionID: '=,string',
		creatorAddress: '=,string',
		releaseYear: '=,string',
		collectionType: '=,number',
		// audios: ['audios', {
		// 	audioID: '=,string',
		// 	name: '=,number',
		// }],
		search: '=,string',
		limit: '=,number',
		offset: '=,number',
		sort: '=,string',
		order: '=,string',
	},
	definition: {
		data: ['data', collection],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};

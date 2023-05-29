
const collection = require('./mappings/collection');

module.exports = {
	type: 'moleculer',
	method: 'indexer.collection',
	params: {
		name: '=,string',
		collectionID: '=,string',
		creatorAddress: '=,string',
		releaseYear: '=,string',
		collectionType: '=,number',
		// audios: ['data.audios', {
		// 	address: '=,string',
		// }],
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

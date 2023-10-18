const anchor = require('./mappings/anchor');

module.exports = {
	type: 'moleculer',
	method: 'indexer.anchors',
	params: {
		anchorID: '=,string',
		name: '=,string',
		album: '=,string',
		artists: '=,string',
		images: ['images', {
			url: '=,string',
			width: '=,number',
			height: '=,number',
		}],
		votes: ['votes', {
			senderAddress: '=,string',
		}],
		search: '=,string',
		limit: '=,number',
		offset: '=,number',
		sort: '=,string',
		order: '=,string',
	},
	definition: {
		data: ['data', anchor],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};

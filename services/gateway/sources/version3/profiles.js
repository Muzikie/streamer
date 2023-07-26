const profile = require('./mappings/profile');

module.exports = {
	type: 'moleculer',
	method: 'indexer.profiles',
	params: {
		profileID: '=,string',
		name: '=,string',
		nickName: '=,string',
		description: '=,string',
		socialAccounts: ['socialAccounts', {
			username: '=,string',
			platform: '=,number',
		}],
		avatarHash: '=,string',
		avatarSignature: '=,string',
		bannerHash: '=,string',
		bannerSignature: '=,string',
		creatorAddress: '=,string',
		search: '=,string',
	},
	definition: {
		data: ['data', profile],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};

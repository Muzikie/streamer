module.exports = {
	name: '=,string',
	releaseYear: '=,string',
	audioID: '=,string',
	collectionID: '=,string',
	creatorAddress: '=,string',
	collection: {
		collectionType: '=,string',
		releaseYear: '=,number',
		name: '=,string',
	},
	owners: ['owners', {
		address: '=,string',
		shares: '=,number',
		income: '=,number',
	}],
	fit: ['fit', {
		address: '=,string',
		role: '=,string',
	}],
};

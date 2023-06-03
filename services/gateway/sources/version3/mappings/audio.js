module.exports = {
	name: '=,string',
	releaseYear: '=,string',
	audioID: '=,string',
	collectionID: '=,string',
	creatorAddress: '=,string',
	audios: ['collection', {
		collectionType: '=,string',
		releaseYear: '=,number',
		name: '=,number',
	}],
	owners: ['owners', {
		address: '=,string',
		shares: '=,number',
		income: '=,number',
	}],
};

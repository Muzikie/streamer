module.exports = {
	anchorID: '=,string',
	name: '=,string',
	album: '=,string',
	artists: '=,string',
	submitter: '=,string',
	createdAt: '=,string',
	images: ['images', {
		url: '=,string',
		width: '=,number',
		height: '=,number',
	}],
	votes: ['votes', {
		senderAddress: '=,string',
	}],
};

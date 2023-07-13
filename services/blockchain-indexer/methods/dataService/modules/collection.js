const {
	getCollections,
} = require('../controllers/collections');

module.exports = [
	{
		name: 'collections',
		controller: getCollections,
		params: {
			creatorAddress: { optional: true, type: 'string' },
			collectionID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
];

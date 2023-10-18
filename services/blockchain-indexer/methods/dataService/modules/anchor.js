const {
	getAnchors,
} = require('../controllers/anchors');

module.exports = [
	{
		name: 'anchors',
		controller: getAnchors,
		params: {
			submitter: { optional: true, type: 'string' },
			anchorID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
];

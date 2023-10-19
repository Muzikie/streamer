const {
	getBadges,
} = require('../controllers/badges');

module.exports = [
	{
		name: 'badges',
		controller: getBadges,
		params: {
			awardedTo: { optional: true, type: 'string' },
			badgeID: { optional: true, type: 'string' },
			anchorID: { optional: true, type: 'string' },
			type: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			memberAddress: { optional: true, type: 'string' },
		},
	},
];

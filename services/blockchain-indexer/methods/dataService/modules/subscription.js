const {
	getSubscriptions,
} = require('../controllers/subscriptions');

module.exports = [
	{
		name: 'subscriptions',
		controller: getSubscriptions,
		params: {
			creatorAddress: { optional: true, type: 'string' },
			subscriptionID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
];

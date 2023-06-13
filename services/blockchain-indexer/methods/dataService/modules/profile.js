const {
	getProfiles,
} = require('../controllers/profiles');

module.exports = [
	{
		name: 'profiles',
		controller: getProfiles,
		params: {
			creatorAddress: { optional: true, type: 'string' },
			profileID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
];

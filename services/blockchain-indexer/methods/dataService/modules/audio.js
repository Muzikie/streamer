const {
	getAudios,
} = require('../controllers/audios');

module.exports = [
	{
		name: 'audios',
		controller: getAudios,
		params: {
			creatorAddress: { optional: true, type: 'string' },
			audioID: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
		},
	},
];

const {
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getBadges = async params => {
	const badges = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getBadges(params);
		if (response.data) badges.data = response.data;
		if (response.meta) badges.meta = response.meta;

		return badges;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getBadges,
};

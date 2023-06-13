const {
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getProfiles = async params => {
	const profiles = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getProfiles(params);
		if (response.data) profiles.data = response.data;
		if (response.meta) profiles.meta = response.meta;

		return profiles;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getProfiles,
};

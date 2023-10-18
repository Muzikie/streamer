const {
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getAnchors = async params => {
	const anchors = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getAnchors(params);
		if (response.data) anchors.data = response.data;
		if (response.meta) anchors.meta = response.meta;

		return anchors;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getAnchors,
};

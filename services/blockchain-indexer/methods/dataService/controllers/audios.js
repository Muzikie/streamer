const {
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getAudios = async params => {
	const audios = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getAudios(params);
		if (response.data) audios.data = response.data;
		if (response.meta) audios.meta = response.meta;

		return audios;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getAudios,
};

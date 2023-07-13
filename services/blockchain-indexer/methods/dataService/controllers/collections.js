const {
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getCollections = async params => {
	const collections = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getCollections(params);
		if (response.data) collections.data = response.data;
		if (response.meta) collections.meta = response.meta;

		return collections;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getCollections,
};

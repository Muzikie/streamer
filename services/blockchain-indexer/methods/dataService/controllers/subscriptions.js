const {
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getSubscriptions = async params => {
	const subscriptions = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getSubscriptions(params);
		if (response.data) subscriptions.data = response.data;
		if (response.meta) subscriptions.meta = response.meta;

		return subscriptions;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getSubscriptions,
};

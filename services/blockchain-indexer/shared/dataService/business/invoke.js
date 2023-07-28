/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const util = require('util');
const { validator } = require('@liskhq/lisk-validator');

const { Exceptions: { ValidationException } } = require('lisk-service-framework');

const { requestConnector } = require('../../utils/request');
const {
	getRegisteredEndpoints,
	getSystemMetadata,
	getEngineEndpoints,
	getAllRegisteredEndpoints,
} = require('../../constants');

const checkIfEndpointRegistered = async (endpoint) => {
	const allRegisteredEndpoints = await getAllRegisteredEndpoints();
	return allRegisteredEndpoints.includes(endpoint);
};

const validateEndpointParams = async (invokeEndpointParams) => {
	let requestParamsSchema;

	const registeredEndpoints = await getRegisteredEndpoints();

	// Check if module or engine based endpoint
	// Resolve request params schema based on the type of endpoint
	if (registeredEndpoints.includes(invokeEndpointParams.endpoint)) {
		const metadata = await getSystemMetadata();
		const [moduleName, endpointName] = invokeEndpointParams.endpoint.split('_');
		const endpointInfo = (metadata.modules
			.find(module => module.name === moduleName)).endpoints
			.find(endpoint => endpoint.name === endpointName);
		requestParamsSchema = endpointInfo.request;
	} else {
		const engineEndpoints = await getEngineEndpoints();

		const endpointInfo = engineEndpoints
			.find(endpoint => endpoint.name === invokeEndpointParams.endpoint);
		requestParamsSchema = endpointInfo.request;
	}

	if (requestParamsSchema) {
		validator.validate(requestParamsSchema, invokeEndpointParams.params);
	} else if ('params' in invokeEndpointParams
		&& Object.getOwnPropertyNames(invokeEndpointParams.params).length) {
		// Throw error when params passed but requested endpoint doesn't support any params
		throw new Error('Endpoint does not support request parameters.');
	}
};

const invokeEndpoint = async params => {
	const isRegisteredEndpoint = await checkIfEndpointRegistered(params.endpoint);
	if (!isRegisteredEndpoint) {
		throw new ValidationException(`Endpoint '${params.endpoint}' is not registered.`);
	}

	await validateEndpointParams(params).catch(error => {
		throw new ValidationException(`Invalid params supplied for endpoint '${params.endpoint}': \n${util.inspect(params.params)}.\nError: ${error}`);
	});

	const invokeEndpointRes = {
		data: await requestConnector('invokeEndpoint', params),
		meta: params,
	};

	return invokeEndpointRes;
};

module.exports = {
	invokeEndpoint,

	// For unit testing
	checkIfEndpointRegistered,
	validateEndpointParams,
};

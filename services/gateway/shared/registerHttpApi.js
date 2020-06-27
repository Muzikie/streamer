/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const { mapper, Utils } = require('lisk-service-framework');
const path = require('path');

const apiMeta = [];

const configureApi = (apiName, apiPrefix) => {
	const transformPath = url => {
		const dropSlash = str => str.replace(/^\//, '');
		const curlyBracketsToColon = str => str.split('{').join(':').replace(/}/g, '');

		return curlyBracketsToColon(dropSlash(url));
	};

	const allMethods = Utils.requireAllJs(path.resolve(__dirname, `../apis/${apiName}/methods`));

	const methods = Object.keys(allMethods).reduce((acc, key) => {
		const method = allMethods[key];
		if (method.version !== '2.0') return { ...acc };
		if (!method.source) return { ...acc };
		if (!method.source.method) return { ...acc };
		if (!method.swaggerApiPath) return { ...acc };
		return { ...acc, [key]: method };
	}, {});

	const whitelist = Object.keys(methods).reduce((acc, key) => [
		...acc, methods[key].source.method,
	], []);

	const getMethodName = method => method.httpMethod ? method.httpMethod : 'GET';

	const aliases = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${getMethodName(methods[key])} ${transformPath(methods[key].swaggerApiPath)}`]: methods[key].source.method,
	}), {});

	const methodPaths = Object.keys(methods).reduce((acc, key) => ({
		...acc, [`${getMethodName(methods[key])} ${transformPath(methods[key].swaggerApiPath)}`]: methods[key],
	}), {});

	const meta = {
		apiPrefix,
		routes: Object.keys(methods).map(m => ({
			path: methods[m].swaggerApiPath,
			params: Object.keys(methods[m].source.params),
			response: {
				...methods[m].envelope,
				...methods[m].source.definition,
			},
		})),
	};

	apiMeta.push(meta);

	return { aliases, whitelist, methodPaths };
};

const mapParam = (source, originalKey, mappingKey) => {
	if (mappingKey) {
		if (originalKey === '=') return { key: mappingKey, value: source[mappingKey] };
		return { key: mappingKey, value: source[originalKey] };
	}
	// logger.warn(`ParamsMapper: Missing mapping for the param ${mappingKey}`);
	return {};
};

const transformParams = (params, specs) => {
	const output = {};
	Object.keys(specs).forEach((specParam) => {
		const result = mapParam(params, specs[specParam], specParam);
		if (result.key) output[result.key] = result.value;
	});
	return output;
};


const registerApi = (apiName, config) => {
	const { aliases, whitelist, methodPaths } = configureApi(apiName, config.path);

	const transformRequest = (apiPath, params) => {
		try {
			const paramDef = methodPaths[apiPath].source.params;
			const transformedParams = transformParams(params, paramDef);
			return transformedParams;
		} catch (e) { return params; }
	};

	const transformResponse = async (apiPath, data) => {
		if (!methodPaths[apiPath]) return data;
		const transformedData = await mapper(data, methodPaths[apiPath].source.definition);
		return {
			...methodPaths[apiPath].envelope,
			...transformedData,
		};
	};

	return {
		...config,

		whitelist: [
			...config.whitelist,
			...whitelist,
		],

		aliases: {
			...config.aliases,
			...aliases,
		},

		async onBeforeCall(ctx, route, req, res) {
			const params = transformRequest(`${req.method.toUpperCase()} ${req.$alias.path}`, req.$params);
			req.$params = params;
		},

		async onAfterCall(ctx, route, req, res, data) {
			// TODO: Add support for ETag
			return transformResponse(`${req.method.toUpperCase()} ${req.$alias.path}`, data);
		},
	};
};

module.exports = registerApi;

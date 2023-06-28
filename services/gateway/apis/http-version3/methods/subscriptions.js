/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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

const subscriptionsSource = require('../../../sources/version3/subscriptions');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/subscriptions',
	rpcMethod: 'get.subscriptions',
	tags: ['Subscriptions'],
	params: {
		creatorAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		subscriptionID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		memberAddress: { type: 'string', required: false },
	},
	get schema() {
		const subscriptionSchema = {};
		subscriptionSchema[this.swaggerApiPath] = { get: {} };
		subscriptionSchema[this.swaggerApiPath].get.tags = this.tags;
		subscriptionSchema[this.swaggerApiPath].get.summary = 'Requests subscriptions data';
		subscriptionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns subscriptions data',
		});
		subscriptionSchema[this.swaggerApiPath].get.parameters = transformParams('subscriptions', this.params);
		subscriptionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of subscriptions',
				schema: {
					$ref: '#/definitions/subscriptionsWithEnvelope',
				},
			},
		};
		Object.assign(subscriptionSchema[this.swaggerApiPath].get.responses, response);
		return subscriptionSchema;
	},
	source: subscriptionsSource,
	envelope,
};

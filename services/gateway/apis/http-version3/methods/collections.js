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

const collectionsSource = require('../../../sources/version3/collections');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/collections',
	rpcMethod: 'get.collections',
	tags: ['Collections'],
	params: {
		creatorAddress: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		collectionID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
	},
	get schema() {
		const collectionSchema = {};
		collectionSchema[this.swaggerApiPath] = { get: {} };
		collectionSchema[this.swaggerApiPath].get.tags = this.tags;
		collectionSchema[this.swaggerApiPath].get.summary = 'Requests collections data';
		collectionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns collections data',
		});
		collectionSchema[this.swaggerApiPath].get.parameters = transformParams('collections', this.params);
		collectionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of collections',
				schema: {
					$ref: '#/definitions/collectionsWithEnvelope',
				},
			},
		};
		Object.assign(collectionSchema[this.swaggerApiPath].get.responses, response);
		return collectionSchema;
	},
	source: collectionsSource,
	envelope,
};

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

const badgesSource = require('../../../sources/version3/badges');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/badges',
	rpcMethod: 'get.badges',
	tags: ['Badges'],
	params: {
		awardedTo: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		badgeID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		anchorID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		type: { optional: true, type: 'string' },
	},
	get schema() {
		const badgeSchema = {};
		badgeSchema[this.swaggerApiPath] = { get: {} };
		badgeSchema[this.swaggerApiPath].get.tags = this.tags;
		badgeSchema[this.swaggerApiPath].get.summary = 'Requests badges data';
		badgeSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns badges data',
		});
		badgeSchema[this.swaggerApiPath].get.parameters = transformParams('badges', this.params);
		badgeSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of badges',
				schema: {
					$ref: '#/definitions/badgesWithEnvelope',
				},
			},
		};
		Object.assign(badgeSchema[this.swaggerApiPath].get.responses, response);
		return badgeSchema;
	},
	source: badgesSource,
	envelope,
};

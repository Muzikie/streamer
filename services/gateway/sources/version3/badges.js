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
const badge = require('./mappings/badge');

module.exports = {
	type: 'moleculer',
	method: 'indexer.badges',
	params: {
		badgeID: '=,string',
		anchorID: '=,string',
		awardedTo: '=,string',
		type: '=,string',
		awardDate: '=,string',
		rank: '=,number',
		prize: '=,string',
		claimed: '=,boolean',
		limit: '=,number',
		offset: '=,number',
		sort: '=,string',
		order: '=,string',
	},
	definition: {
		data: ['data', badge],
		meta: {
			count: '=,number',
			offset: '=,number',
			total: '=,number',
		},
		links: {},
	},
};

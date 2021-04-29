/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const logger = require('lisk-service-framework').Logger();
const core = require('../shared/core');
const config = require('../config');

const genesisHeight = core.getGenesisHeight();

module.exports = [
	{
		name: 'index.missing.blocks',
		description: 'Keep the blocks index up-to-date',
		schedule: '0 */3 * * *', // Every 3 hours
		updateOnInit: true,
		init: () => { },
		controller: async () => {
			if (config.jobs.missingBlocks.enabled) {
				logger.debug('Checking for missing blocks in index...');
				const toHeight = (await core.getNetworkStatus()).data.height;
				const fromHeight = config.jobs.missingBlocks.range > 0
					? toHeight - config.jobs.missingBlocks.range : genesisHeight;
				await core.indexMissingBlocks(fromHeight, toHeight);
			}
		},
	},
];
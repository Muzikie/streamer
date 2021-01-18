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
const coreApi = require('./coreApi');

const getNetworkStatus = async () => {
	const status = await coreApi.getNetworkStatus();
	const { offset } = status.data.genesisConfig.rewards;
	const { distance } = status.data.genesisConfig.rewards;
	status.data.operations = [];
	status.data.registeredModules.forEach(liskModule => {
		if (liskModule.transactionAssets.length) {
			status.data.operations = status.data.operations
				.concat(
					liskModule.transactionAssets.map(asset => {
						const id = String(liskModule.id).concat(':').concat(asset.id);
						const name = liskModule.name.concat(':').concat(asset.name);
						return { id, name };
					}));
		}
	});
	const rewardIndex = Math.floor((status.data.height - offset) / distance);
	const finalRewardIndex = rewardIndex >= status.data.genesisConfig.rewards.milestones.length
		? status.data.genesisConfig.rewards.milestones.length - 1 : rewardIndex;
	status.data.currentReward = finalRewardIndex >= 0
		? status.data.genesisConfig.rewards.milestones[finalRewardIndex] : 0;
	status.data.registeredModules = status.data.registeredModules.map(item => item.name);
	status.data.lastUpdate = Math.floor(Date.now() / 1000);
	return status;
};

module.exports = {
	getNetworkStatus,
};

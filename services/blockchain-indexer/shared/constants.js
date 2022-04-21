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
const blockchainStore = require('./database/blockchainStore');
const { requestRpc } = require('./utils/appContext');

const setFinalizedHeight = (height) => blockchainStore.set('finalizedHeight', height);
const getFinalizedHeight = () => blockchainStore.get('finalizedHeight');

const setGenesisHeight = (height) => blockchainStore.set('genesisHeight', height);
const getGenesisHeight = () => blockchainStore.get('genesisHeight');

let genesisConfig;

const updateFinalizedHeight = async () => {
	const { finalizedHeight } = await requestRpc('getNodeInfo');
	await setFinalizedHeight(finalizedHeight);
};

const updateGenesisHeight = async () => {
	const { genesisHeight } = await requestRpc('getNodeInfo');
	await setGenesisHeight(genesisHeight);
};

const getCurrentHeight = async () => {
	const currentHeight = (await requestRpc('getNodeInfo')).height;
	return currentHeight;
};

const getGenesisConfig = async () => {
	if (!genesisConfig) genesisConfig = (await requestRpc('getNodeInfo')).genesisConfig;
	return genesisConfig;
};

const resolveModuleAssets = (data) => {
	let result = [];
	data.forEach(liskModule => {
		if (liskModule.transactionAssets.length) {
			result = result.concat(
				liskModule.transactionAssets.map(asset => {
					const id = String(liskModule.id).concat(':').concat(asset.id);
					if (liskModule.name && asset.name) {
						const name = liskModule.name.concat(':').concat(asset.name);
						return { id, name };
					}
					return { id };
				}),
			);
		}
	});
	return result;
};

const getAvailableLiskModuleAssets = async () => {
	const registeredModules = await requestRpc('getRegisteredModules', {});
	return resolveModuleAssets(registeredModules);
};

module.exports = {
	updateFinalizedHeight,
	getFinalizedHeight,
	getCurrentHeight,
	getGenesisConfig,
	getGenesisHeight,
	updateGenesisHeight,
	getAvailableLiskModuleAssets,
};
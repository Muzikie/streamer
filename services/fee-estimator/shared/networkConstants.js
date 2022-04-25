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
const { requestConnector } = require('./utils/request');

let networkFees;
let genesisConfig;

const networkFeeConstants = {
	minFeePerByte: undefined,
	baseFeeByModuleAssetId: {},
	baseFeeByModuleAssetName: {},
};

const resolveBaseFees = (networkConstants) => {
	networkConstants.data.genesisConfig.baseFees.forEach(entry => {
		const moduleAssetId = String(entry.moduleID).concat(':').concat(entry.assetID);
		networkFeeConstants.baseFeeByModuleAssetId[moduleAssetId] = entry.baseFee;

		const [moduleAsset] = networkConstants.data.moduleAssets.filter(o => o.id === moduleAssetId);
		networkFeeConstants.baseFeeByModuleAssetName[moduleAsset.name] = entry.baseFee;
	});
	networkFeeConstants.minFeePerByte = networkConstants.data.genesisConfig.minFeePerByte;

	return networkFeeConstants;
};

const setNetworkFeeConstants = async () => {
	if (!networkFees) {
		const result = await requestConnector('getNetworkStatus');
		networkFees = resolveBaseFees(result);
	}
};

const setGenesisConfig = async () => {
	if (!genesisConfig) {
		const result = await requestConnector('getNetworkStatus');
		genesisConfig = result.data.genesisConfig;
	}
};

const getNetworkFeeConstants = () => networkFees;

const getGenesisConfig = () => genesisConfig;

const init = async () => {
	await setGenesisConfig();
	await setNetworkFeeConstants();
};

module.exports = {
	init,
	getNetworkFeeConstants,
	getGenesisConfig,
};
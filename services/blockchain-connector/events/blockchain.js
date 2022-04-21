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
const {
	appReadyController,
	appShutdownController,
	appNetworkReadyController,
	appNetworkEventController,
	appTransactionNewController,
	appChainForkController,
	appChainValidatorsChangeController,
	appBlockNewController,
	appBlockDeleteController,
} = require('./controller/blockchain');

const sdkEvents = [
	{
		name: 'appReady',
		get description() { return `Event ${this.name}`; },
		controller: appReadyController,
	},
	{
		name: 'appShutdown',
		get description() { return `Event ${this.name}`; },
		controller: appShutdownController,
	},
	{
		name: 'appNetworkReady',
		get description() { return `Event ${this.name}`; },
		controller: appNetworkReadyController,
	},
	{
		name: 'appNetworkEvent',
		get description() { return `Event ${this.name}`; },
		controller: appNetworkEventController,
	},
	{
		name: 'appTransactionNew',
		get description() { return `Event ${this.name}`; },
		controller: appTransactionNewController,
	},
	{
		name: 'appChainFork',
		get description() { return `Event ${this.name}`; },
		controller: appChainForkController,
	},
	{
		name: 'appChainValidatorsChange',
		get description() { return `Event ${this.name}`; },
		controller: appChainValidatorsChangeController,
	},
	{
		name: 'appBlockNew',
		get description() { return `Event ${this.name}`; },
		controller: appBlockNewController,
	},
	{
		name: 'appBlockDelete',
		get description() { return `Event ${this.name}`; },
		controller: appBlockDeleteController,
	},
];

module.exports = sdkEvents;
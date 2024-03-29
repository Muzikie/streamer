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
	getGenerators,
	getNumberOfGenerators,
	reloadGeneratorsCache,
} = require('./generators');

const {
	getBlocks,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,
} = require('./blocks');

const {
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
} = require('./transactions');

const {
	getPendingTransactions,
	loadAllPendingTransactions,
} = require('./pendingTransactions');

const {
	getBlockchainApps,
	getBlockchainAppsStatistics,
	getChainAccount,
	getMainchainID,
	reloadBlockchainAppsStats,
} = require('./interoperability');

const {
	tokenHasUserAccount,
	getTokenBalances,
	getTokenSummary,
	getTokenConstants,
} = require('./token');

const {
	getPosValidators,
	getAllPosValidators,
	getPosValidatorsByStake,
	isPosModuleRegistered,
	getPosLockedRewards,
	getStakes,
	getStakers,
	getPosClaimableRewards,
	getPosUnlocks,
	getPosConstants,
} = require('./pos');

const {
	getDefaultRewardAtHeight,
	getAnnualInflation,
	getRewardConstants,
} = require('./dynamicReward');

const { getSchemas } = require('./schemas');
const { getAuthAccountInfo } = require('./auth');
const { getLegacyAccountInfo } = require('./legacy');
const { postTransactions } = require('./postTransactions');
const {
	getEvents,
	getEventsByHeight,
	deleteEventsFromCache,
} = require('./events');
const { dryRunTransactions } = require('./transactionsDryRun');
const { getValidator, validateBLSKey } = require('./validator');
const {
	getNetworkStatus,
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,
} = require('./network');

// Muzikie Dedicated Modules
const { getSubscriptions } = require('./subscriptions');
const { getCollections } = require('./collections');
const { getAudios } = require('./audios');
const { getProfiles } = require('./profiles');

module.exports = {
	// Generators
	getGenerators,
	getNumberOfGenerators,
	reloadGeneratorsCache,

	// Blocks
	getBlocks,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
	getBlocksAssets,

	// Transactions
	getTransactions,
	getTransactionIDsByBlockID,
	getTransactionsByBlockID,
	getTransactionsByIDs,
	normalizeTransaction,
	getPendingTransactions,
	loadAllPendingTransactions,
	postTransactions,
	dryRunTransactions,

	// Events
	getEvents,
	getEventsByHeight,
	deleteEventsFromCache,

	// Interoperability
	getBlockchainApps,
	getChainAccount,
	getMainchainID,
	getBlockchainAppsStatistics,
	reloadBlockchainAppsStats,

	// Token
	tokenHasUserAccount,
	getTokenBalances,
	getTokenSummary,
	getTokenConstants,

	// PoS
	getPosValidators,
	getAllPosValidators,
	getPosValidatorsByStake,
	isPosModuleRegistered,
	getPosLockedRewards,
	getStakes,
	getStakers,
	getPosClaimableRewards,
	getPosUnlocks,
	getPosConstants,

	// Schemas
	getSchemas,

	// Auth
	getAuthAccountInfo,

	// Legacy
	getLegacyAccountInfo,

	// Validator
	getValidator,
	validateBLSKey,

	// Dynamic Reward
	getAnnualInflation,
	getDefaultRewardAtHeight,
	getRewardConstants,

	// Network
	getNetworkStatus,
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,

	// subscriptions
	getSubscriptions,

	// collections
	getCollections,

	// audios
	getAudios,

	// profiles
	getProfiles,
};

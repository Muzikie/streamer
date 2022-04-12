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
const BluebirdPromise = require('bluebird');

const {
	CacheRedis,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const { requestRpc } = require('../utils/appContext');
const { getIndexedAccountInfo } = require('../utils/accountUtils');
const { getTxnMinFee } = require('../utils/transactionsUtils');
const { parseToJSONCompatObj, parseInputBySchema } = require('../utils/parser');
const { normalizeRangeParam } = require('../utils/paramUtils');
const { getFinalizedHeight } = require('../constants');
const { getTableInstance } = require('../database/mysql');

const blocksIndexSchema = require('../indexer/schema/blocks');

const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema);

const config = require('../../config');

const blockchainStore = require('../database/blockchainStore');

const latestBlockCache = CacheRedis('latestBlock', config.endpoints.cache);

let latestBlock;
// Genesis height can be greater that 0
// Blockchain starts form a non-zero block height
const getGenesisHeight = () => blockchainStore.get('genesisHeight');

const normalizeBlocks = async (blocks, includeGenesisAccounts = false) => {
	const normalizedBlocks = await BluebirdPromise.map(
		blocks.map(block => ({ ...block.header, payload: block.payload })),
		async block => {
			const account = block.generatorPublicKey
				? await getIndexedAccountInfo({ publicKey: block.generatorPublicKey.toString('hex'), limit: 1 }, ['address', 'username'])
				: {};
			block.generatorAddress = account && account.address ? account.address : null;
			block.generatorUsername = account && account.username ? account.username : null;
			block.isFinal = block.height <= (await getFinalizedHeight());
			block.numberOfTransactions = block.payload.length;

			block.size = 0;
			block.totalForged = BigInt(block.reward);
			block.totalBurnt = BigInt('0');
			block.totalFee = BigInt('0');

			await BluebirdPromise.map(
				block.payload,
				async (txn) => {
					const schema = await requestRpc('getSchema');
					const assetSchema = schema.transactionsAssets
						.find(s => s.moduleID === txn.moduleID && s.assetID === txn.assetID);
					const parsedTxAsset = parseInputBySchema(txn.asset, assetSchema.schema);
					const parsedTx = parseInputBySchema(txn, schema.transaction);
					txn = { ...parsedTx, asset: parsedTxAsset };
					txn.minFee = await getTxnMinFee(txn);
					block.size += txn.size;
					block.totalForged += txn.fee;
					block.totalBurnt += txn.minFee;
					block.totalFee += txn.fee - txn.minFee;
				},
				{ concurrency: 1 },
			);

			if (includeGenesisAccounts !== true) {
				const {
					accounts,
					initRounds,
					initDelegates,
					...otherAssets
				} = block.asset;

				block.asset = { ...otherAssets };
			}

			return parseToJSONCompatObj(block);
		},
		{ concurrency: blocks.length },
	);

	return normalizedBlocks;
};

const getBlockByHeight = async (height, includeGenesisAccounts = false) => {
	const response = await requestRpc('getBlockByHeight', { height });
	return normalizeBlocks([response], includeGenesisAccounts);
};

const getBlockByID = async id => {
	const response = await requestRpc('getBlockByID', { id });
	return normalizeBlocks([response]);
};

const getBlocksByIDs = async ids => {
	const response = await requestRpc('getBlocksByIDs', { ids });
	return normalizeBlocks(response);
};

const getBlocksByHeightBetween = async (from, to) => {
	const response = await requestRpc('getBlocksByHeightBetween', { from, to });
	return normalizeBlocks(response);
};

const getLastBlock = async () => {
	const response = await requestRpc('getLastBlock');
	[latestBlock] = await normalizeBlocks(response.data);
	if (latestBlock && latestBlock.id) await latestBlockCache.set('latestBlock', JSON.stringify(latestBlock));
	return [latestBlock];
};

const isQueryFromIndex = params => {
	const paramProps = Object.getOwnPropertyNames(params);

	const directQueryParams = ['id', 'height', 'heightBetween'];
	const defaultQueryParams = ['limit', 'offset', 'sort'];

	// For 'isDirectQuery' to be 'true', the request params should contain
	// exactly one of 'directQueryParams' and all of them must be contained
	// within 'directQueryParams' or 'defaultQueryParams'
	const isDirectQuery = (paramProps.filter(prop => directQueryParams.includes(prop))).length === 1
		&& paramProps.every(prop => directQueryParams.concat(defaultQueryParams).includes(prop));

	const sortOrder = params.sort ? params.sort.split(':')[1] : undefined;
	const isLatestBlockFetch = (paramProps.length === 1 && params.limit === 1)
		|| (paramProps.length === 2
			&& ((params.limit === 1 && params.offset === 0)
				|| (sortOrder === 'desc' && (params.limit === 1 || params.offset === 0))
			))
		|| (paramProps.length === 3 && params.limit === 1 && params.offset === 0 && sortOrder === 'desc');

	return !isDirectQuery && !isLatestBlockFetch;
};

const getBlocks = async params => {
	const blocksDB = await getBlocksIndex();
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockId) {
		const { blockId, ...remParams } = params;
		params = remParams;
		params.id = blockId;
	}

	let accountInfo;

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;
		accountInfo = await getIndexedAccountInfo({ address, limit: 1 }, ['publicKey']);
	}
	if (params.username) {
		const { username, ...remParams } = params;
		params = remParams;
		accountInfo = await getIndexedAccountInfo({ username, limit: 1 }, ['publicKey']);
	}

	if (accountInfo && accountInfo.publicKey) {
		params.generatorPublicKey = accountInfo.publicKey;
	}

	if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
		params = normalizeRangeParam(params, 'height');
	}

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	const total = await blocksDB.count(params);
	if (isQueryFromIndex(params)) {
		const resultSet = await blocksDB.find(params, ['id']);
		params.ids = resultSet.map(row => row.id);
	}

	try {
		if (params.ids) {
			blocks.data = await getBlocksByIDs(params.ids);
		} else if (params.id) {
			blocks.data = await getBlockByID(params.id);
			if (Array.isArray(blocks.data) && !blocks.data.length) throw new NotFoundException(`Block ID ${params.id} not found.`);
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else if (params.height) {
			blocks.data = await getBlockByHeight(params.height);
			if (Array.isArray(blocks.data) && !blocks.data.length) throw new NotFoundException(`Height ${params.height} not found.`);
			if ('offset' in params && params.limit) blocks.data = blocks.data.slice(params.offset, params.offset + params.limit);
		} else if (params.heightBetween) {
			const { from, to } = params.heightBetween;
			blocks.data = await getBlocksByHeightBetween(from, to);
			if (params.sort) {
				const [sortProp, sortOrder] = params.sort.split(':');
				blocks.data = blocks.data.sort(
					(a, b) => sortOrder === 'asc' ? a[sortProp] - b[sortProp] : b[sortProp] - a[sortProp],
				);
			}
		} else {
			blocks.data = await getLastBlock();
		}
	} catch (err) {
		// Block does not exist
		if (err.message.includes('does not exist')) {
			let errMessage;
			if (err.message.includes(':id')) errMessage = `Block ${params.id} does not exist`;
			if (err.message.includes(':height')) errMessage = `Block at height ${params.height} does not exist`;
			throw new NotFoundException(errMessage);
		}
		throw err;
	}

	blocks.meta = {
		count: blocks.data.length,
		offset: params.offset,
		total,
	};

	return blocks;
};

module.exports = {
	getBlocks,
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getLastBlock,
	getBlockByHeight,
	getBlockByID,
};

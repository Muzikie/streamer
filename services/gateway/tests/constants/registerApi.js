/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
// TODO: Expected response for registerApi method should be dynamically constructed
const expectedResponseForRegisterHttpApi = {
	whitelist: [
		'indexer.audios',
		'indexer.blocks.assets',
		'indexer.blockchain.apps',
		'app-registry.blockchain.apps.meta.list',
		'app-registry.blockchain.apps.meta',
		'indexer.blockchain.apps.statistics',
		'app-registry.blockchain.apps.meta.tokens',
		'app-registry.blockchain.apps.meta.tokens.supported',
		'indexer.blocks',
		'indexer.collections',
		'indexer.events',
		'fees.estimates',
		'indexer.generators',
		'indexer.index.status',
		'connector.invokeEndpoint',
		'market.prices',
		'indexer.network.peers',
		'indexer.network.statistics',
		'indexer.network.status',
		'indexer.transactions.post',
		'indexer.profiles',
		'indexer.schemas',
		'gateway.spec',
		'indexer.subscriptions',
		'indexer.transactions',
		'indexer.transactions.dryrun',
		'statistics.transactions.statistics',
		'indexer.legacy',
		'indexer.pos.rewards.claimable',
		'indexer.pos.constants',
		'indexer.pos.rewards.locked',
		'indexer.pos.stakers',
		'indexer.pos.stakes',
		'indexer.pos.unlocks',
		'indexer.pos.validators',
		'indexer.token.account.exists',
		'indexer.token.balances',
		'indexer.token.constants',
		'indexer.token.summary',
		'indexer.validator',
		'indexer.validateBLSKey',
		'export.transactions.csv',
		'export.transactions.schedule',
	],
	aliases: {
		'GET blocks/assets': 'indexer.blocks.assets',
		'GET collections': 'indexer.collections',
		'GET profiles': 'indexer.profiles',
		'GET audios': 'indexer.audios',
		'GET blockchain/apps': 'indexer.blockchain.apps',
		'GET blockchain/apps/meta/list': 'app-registry.blockchain.apps.meta.list',
		'GET blockchain/apps/meta': 'app-registry.blockchain.apps.meta',
		'GET blockchain/apps/statistics': 'indexer.blockchain.apps.statistics',
		'GET blockchain/apps/meta/tokens': 'app-registry.blockchain.apps.meta.tokens',
		'GET blockchain/apps/meta/tokens/supported': 'app-registry.blockchain.apps.meta.tokens.supported',
		'GET blocks': 'indexer.blocks',
		'GET events': 'indexer.events',
		'GET fees': 'fees.estimates',
		'GET generators': 'indexer.generators',
		'GET index/status': 'indexer.index.status',
		'POST invoke': 'connector.invokeEndpoint',
		'GET market/prices': 'market.prices',
		'GET network/peers': 'indexer.network.peers',
		'GET network/statistics': 'indexer.network.statistics',
		'GET network/status': 'indexer.network.status',
		'POST transactions': 'indexer.transactions.post',
		'GET schemas': 'indexer.schemas',
		'GET subscriptions': 'indexer.subscriptions',
		'GET spec': 'gateway.spec',
		'GET transactions': 'indexer.transactions',
		'POST transactions/dryrun': 'indexer.transactions.dryrun',
		'GET transactions/statistics': 'statistics.transactions.statistics',
		'GET legacy': 'indexer.legacy',
		'GET pos/rewards/claimable': 'indexer.pos.rewards.claimable',
		'GET pos/constants': 'indexer.pos.constants',
		'GET pos/rewards/locked': 'indexer.pos.rewards.locked',
		'GET pos/stakers': 'indexer.pos.stakers',
		'GET pos/stakes': 'indexer.pos.stakes',
		'GET pos/unlocks': 'indexer.pos.unlocks',
		'GET pos/validators': 'indexer.pos.validators',
		'GET token/account/exists': 'indexer.token.account.exists',
		'GET token/balances': 'indexer.token.balances',
		'GET token/constants': 'indexer.token.constants',
		'GET token/summary': 'indexer.token.summary',
		'GET validator': 'indexer.validator',
		'POST validator/validate-bls-key': 'indexer.validateBLSKey',
		'GET export/download': 'export.transactions.csv',
		'GET export/transactions': 'export.transactions.schedule',
	},
};

// TODO: Expected response for registerApi method should be dynamically constructed
const expectedResponseForRegisterRpcApi = {
	events: {
		request: {
			whitelist: [
				'indexer.audios',
				'indexer.blocks.assets',
				'indexer.blockchain.apps',
				'app-registry.blockchain.apps.meta.list',
				'app-registry.blockchain.apps.meta',
				'indexer.blockchain.apps.statistics',
				'app-registry.blockchain.apps.meta.tokens',
				'app-registry.blockchain.apps.meta.tokens.supported',
				'indexer.blocks',
				'indexer.collections',
				'indexer.events',
				'fees.estimates',
				'indexer.generators',
				'indexer.index.status',
				'connector.invokeEndpoint',
				'market.prices',
				'indexer.network.peers',
				'indexer.network.statistics',
				'indexer.network.status',
				'indexer.transactions.post',
				'indexer.profiles',
				'indexer.schemas',
				'indexer.subscriptions',
				'indexer.transactions',
				'indexer.transactions.dryrun',
				'statistics.transactions.statistics',
				'indexer.legacy',
				'indexer.pos.rewards.claimable',
				'indexer.pos.constants',
				'indexer.pos.rewards.locked',
				'indexer.pos.stakers',
				'indexer.pos.stakes',
				'indexer.pos.unlocks',
				'indexer.pos.validators',
				'indexer.token.account.exists',
				'indexer.token.balances',
				'indexer.token.constants',
				'indexer.token.summary',
				'indexer.validator',
				'indexer.validateBLSKey',
				'export.transactions.schedule',
			],
			aliases: {
				'get.blocks.assets': 'indexer.blocks.assets',
				'get.collections': 'indexer.collections',
				'get.audios': 'indexer.audios',
				'get.blockchain.apps': 'indexer.blockchain.apps',
				'get.blockchain.apps.meta.list': 'app-registry.blockchain.apps.meta.list',
				'get.blockchain.apps.meta': 'app-registry.blockchain.apps.meta',
				'get.blockchain.apps.statistics': 'indexer.blockchain.apps.statistics',
				'get.blockchain.apps.meta.tokens': 'app-registry.blockchain.apps.meta.tokens',
				'get.blockchain.apps.meta.tokens.supported': 'app-registry.blockchain.apps.meta.tokens.supported',
				'get.blocks': 'indexer.blocks',
				'get.events': 'indexer.events',
				'get.fees': 'fees.estimates',
				'get.generators': 'indexer.generators',
				'get.index.status': 'indexer.index.status',
				'post.invoke': 'connector.invokeEndpoint',
				'get.market.prices': 'market.prices',
				'get.network.peers': 'indexer.network.peers',
				'get.network.statistics': 'indexer.network.statistics',
				'get.network.status': 'indexer.network.status',
				'get.profiles': 'indexer.profiles',
				'post.transactions': 'indexer.transactions.post',
				'get.schemas': 'indexer.schemas',
				'get.subscriptions': 'indexer.subscriptions',
				'get.transactions': 'indexer.transactions',
				'post.transactions.dryrun': 'indexer.transactions.dryrun',
				'get.transactions.statistics': 'statistics.transactions.statistics',
				'get.legacy': 'indexer.legacy',
				'get.pos.rewards.claimable': 'indexer.pos.rewards.claimable',
				'get.pos.constants': 'indexer.pos.constants',
				'get.pos.rewards.locked': 'indexer.pos.rewards.locked',
				'get.pos.stakers': 'indexer.pos.stakers',
				'get.pos.stakes': 'indexer.pos.stakes',
				'get.pos.unlocks': 'indexer.pos.unlocks',
				'get.pos.validators': 'indexer.pos.validators',
				'get.token.account.exists': 'indexer.token.account.exists',
				'get.token.balances': 'indexer.token.balances',
				'get.token.constants': 'indexer.token.constants',
				'get.token.summary': 'indexer.token.summary',
				'get.validator': 'indexer.validator',
				'post.validator.validate-bls-key': 'indexer.validateBLSKey',
				'get.export.transactions': 'export.transactions.schedule',
			},
			mappingPolicy: 'restrict',
		},
	},
};

const methodDefForTransformResponse = {
	source: {
		definition: {
			data: [
				'data',
				{
					chainID: '=,string',
					chainName: '=,string',
					tokenID: '=,string',
					tokenName: '=,string',
					networkType: 'network,string',
					description: '=,string',
					logo: {
						png: '=,string',
						svg: '=,string',
					},
					symbol: '=,string',
					displayDenom: '=,string',
					baseDenom: '=,string',
					denomUnits: [
						'denomUnits',
						{
							denom: '=,string',
							decimals: '=,number',
							aliases: '=',
						},
					],
					customNumber: 'otherName,number', // Should use value of otherName key and covert to number
				},
			],
			meta: {
				count: '=,number',
				offset: '=,number',
				total: '=,number',
			},
			links: {},
		},
	},
	data: [],
	meta: {},
};

const dataForTransformResponse = {
	data: [
		{
			tokenID: '0300000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			chainID: '03000000',
			chainName: 'Lisk',
			network: 'alphanet',
			otherName: '123',
		},
		{
			tokenID: '0400000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			chainID: '04000000',
			chainName: 'Lisk',
			network: 'devnet',
			otherName: '456',
		},
	],
	meta: {
		count: 2,
		offset: 0,
		total: 5,
	},
};

const expectedResponseForTransformResponse = {
	data: [
		{
			chainID: '03000000',
			chainName: 'Lisk',
			tokenID: '0300000000000000',
			tokenName: 'Lisk',
			networkType: 'alphanet',
			description: 'Default token for the entire Lisk ecosystem',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			symbol: 'LSK',
			displayDenom: 'lsk',
			baseDenom: 'beddows',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			customNumber: 123,
		},
		{
			chainID: '04000000',
			chainName: 'Lisk',
			tokenID: '0400000000000000',
			tokenName: 'Lisk',
			networkType: 'devnet',
			description: 'Default token for the entire Lisk ecosystem',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			symbol: 'LSK',
			displayDenom: 'lsk',
			baseDenom: 'beddows',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			customNumber: 456,
		},
	],
	meta: {
		count: 2,
		offset: 0,
		total: 5,
	},
};

const paramsForTransformRequest = {
	tokenName: 'Lisk,Lis,Lik',
	tokenIDParam: '0300000000000000,0400000000000000',
	network: 'devnet,alphanet',
	limit: 10,
	offset: 0,
	sort: 'chainName:asc',
};

const methodDefForTransformRequest = {
	source: {
		params: {
			chainName: '=,string',
			chainID: '=,string',
			tokenName: '=,string',
			tokenID: 'tokenIDParam,string', // Should fetch value from tokenIDParam and map with tokenID key
			network: '=,string',
			search: '=,string',
			offset: '=,number',
			limit: '=,number',
			sort: '=,string',
		},
	},
};

const expectedResponseForTransformRequest = {
	chainID: undefined,
	chainName: undefined,
	limit: 10,
	network: 'devnet,alphanet',
	offset: 0,
	search: undefined,
	sort: 'chainName:asc',
	tokenID: '0300000000000000,0400000000000000',
	tokenName: 'Lisk,Lis,Lik',
};

const sourceForMapParamWithType = {
	key_str: 'val_str',
	key_bool: true,
	key_number: 123,
};

const paramsForTransformParams = {
	key_str: 'val_str',
	key_bool: true,
	key_number: 123,
	obj: { key: 'value' },
	arr: [1, 2, 3],
};

const specsForTransformParams = {
	new_key_str: 'key_str, string',
	key_bool: '=,boolean',
	str_from_number: 'key_number,string',
	obj: '=',
	arr: '=',
};

const expectedResponseForTransformParams = {
	new_key_str: 'val_str',
	key_bool: true,
	str_from_number: '123',
	obj: { key: 'value' },
	arr: [1, 2, 3],
};

const sourceForMapParam = {
	originalKey: 'originalValue',
	mappingKey: 'mappingValue',
};

module.exports = {
	expectedResponseForRegisterHttpApi,
	expectedResponseForRegisterRpcApi,

	methodDefForTransformResponse,
	dataForTransformResponse,
	expectedResponseForTransformResponse,

	paramsForTransformRequest,
	methodDefForTransformRequest,
	expectedResponseForTransformRequest,

	sourceForMapParamWithType,

	paramsForTransformParams,
	specsForTransformParams,
	expectedResponseForTransformParams,

	sourceForMapParam,
};

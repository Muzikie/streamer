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
const { HTTP, Logger, CacheRedis } = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const requestLib = HTTP.request;
const logger = Logger();

const { validateEntries } = require('./common');
const config = require('../../../config');

const exchangeratesapiCache = CacheRedis('exchangeratesapi_prices', config.endpoints.redis);

const accessKey = config.access_key.exchangeratesapi;

const currencies = ['EUR', 'USD', 'CHF', 'BTC'];
const expireMiliseconds = config.ttl.exchangeratesapi;
const { apiEndpoint, allowRefreshAfter } = config.market.sources.exchangeratesapi;

const symbolMap = {
	EUR_USD: 'EURUSD',
	EUR_CHF: 'EURCHF',
	EUR_BTC: 'EURBTC',
};

const fetchAllCurrencyConversionRates = async () => {
	try {
		const allMarketConversionRates = {};
		await BluebirdPromise.all(
			currencies.map(async (baseCurrency) => {
				const remainingCurrencies = currencies.filter(c => c !== baseCurrency);
				const response = await requestLib(`${apiEndpoint}/latest?access_key=${accessKey}&base=${baseCurrency}&symbols=${remainingCurrencies.join(',')}`);
				if (response) allMarketConversionRates[baseCurrency] = response.data.rates;
			}),
		);
		return allMarketConversionRates;
	} catch (err) {
		logger.error(err.message);
		logger.error(err.stack);
		return err;
	}
};

const standardizeCurrencyConversionRates = (rawConversionRates) => {
	const [transformedConversionRates] = Object.entries(rawConversionRates).map(
		([baseCur, convRates]) => Object.getOwnPropertyNames(convRates)
			.map(targetCur => ({ symbol: `${baseCur}_${targetCur}`, price: convRates[targetCur] })),
	);
	const standardizedConversionRates = (Array.isArray(transformedConversionRates))
		? transformedConversionRates.map(convRate => {
			const [from, to] = convRate.symbol.split('_');
			const price = {
				code: convRate.symbol,
				from,
				to,
				rate: convRate.price,
				updateTimestamp: Math.floor(Date.now() / 1000),
				sources: ['exchangeratesapi'],
			};
			return price;
		})
		: [];
	return standardizedConversionRates;
};

const getFromCache = async () => {
	// Read individual price item from cache and deserialize
	const ConversionRates = await BluebirdPromise.map(
		Object.getOwnPropertyNames(symbolMap),
		async (itemCode) => {
			const serializedPrice = await exchangeratesapiCache.get(`exchangeratesapi_${itemCode}`);
			if (serializedPrice) return JSON.parse(serializedPrice);
			return null;
		},
		{ concurrency: Object.getOwnPropertyNames(symbolMap).length },
	);
	if (ConversionRates.includes(null)) return null;
	return ConversionRates;
};

const reload = async () => {
	// Skip updates if there is no accessKey
	if (!accessKey) return;

	const conversionRatesFromCache = await getFromCache();

	// Check if prices exists in cache
	if (!conversionRatesFromCache || validateEntries(await getFromCache(), allowRefreshAfter)) {
		const currencyConversionRates = await fetchAllCurrencyConversionRates();
		const transformedRates = standardizeCurrencyConversionRates(currencyConversionRates);

		// Serialize individual price item and write to the cache
		await BluebirdPromise.all(transformedRates
			.map(item => exchangeratesapiCache.set(`exchangeratesapi_${item.code}`, JSON.stringify(item), expireMiliseconds)));
	}
};

module.exports = {
	reload,
	getFromCache,
};

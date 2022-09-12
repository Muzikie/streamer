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
const fs = require('fs');
const { Logger } = require('lisk-service-framework');
const config = require('../../config');

const logger = Logger();

const connectionPool = {};
const tablePool = {};

const loadSchema = async (knex, tableName, tableConfig) => {
	const { primaryKey, charset, schema, indexes } = tableConfig;

	if (await knex.schema.hasTable(tableName)) return knex;

	await knex.schema
		.createTable(tableName, table => {
			if (charset) table.charset(charset);

			Object.keys(schema).map(p => {
				const kProp = (table[schema[p].type])(p);
				if (schema[p].null === false) kProp.notNullable();
				if ('defaultValue' in schema[p]) kProp.defaultTo(schema[p].defaultValue);
				if (indexes[p]) kProp.index();
				return kProp;
			});
			table.primary(primaryKey);
		});

	return knex;
};

const createDbConnection = async (dbDataDir, tableName) => {
	const knex = require('knex')({
		client: 'better-sqlite3',
		connection: {
			filename: `./${dbDataDir}/${tableName}_db.sqlite3`,
		},
		useNullAsDefault: true,
		pool: {
			max: 100,
			min: 2,
		},
		log: {
			warn(message) { logger.warn(message); },
			error(message) { logger.error(message); },
			deprecate(message) { logger.warn(message); },
			debug(message) { logger.debug(message); },
		},
	});

	knex.select(1)
		.on('query-error', error => {
			logger.error(error.message);
		})
		.catch(err => {
			if (err.code === 'ECONNREFUSED') {
				logger.error(err.message);
				logger.fatal('Unable to connect to the database, shutting down the process...');
				process.exit(1);
			}
			logger.error(err.message);
		});

	return knex;
};

const cast = (val, type) => {
	if (type === 'number') return Number(val);
	if (type === 'integer') return Number(val);
	if (type === 'string') return String(val);
	if (type === 'boolean') return Boolean(val);
	if (type === 'bigInteger') return BigInt(val);
	if (type === 'json') return JSON.stringify(val);
	return val;
};

const resolveQueryParams = params => {
	const KNOWN_QUERY_PARAMS = [
		'sort', 'limit', 'propBetweens', 'andWhere', 'orWhere', 'orWhereWith', 'offset',
		'whereIn', 'orWhereIn', 'search', 'aggregate', 'whereJsonSupersetOf',
	];
	const queryParams = Object.keys(params)
		.filter(key => !KNOWN_QUERY_PARAMS.includes(key))
		.reduce((obj, key) => {
			obj[key] = params[key];
			return obj;
		}, {});
	return queryParams;
};

const getValue = val => {
	if (typeof val === 'undefined') return null;
	if (Number.isNaN(val)) return null;
	return val;
};

const mapRowsBySchema = async (rawRows, schema) => {
	const rows = [];
	rawRows.forEach(item => {
		const row = {};
		Object.keys(schema).forEach(o => {
			const val = item[o];
			if (val || val === 0 || val === false) row[o] = getValue(cast(val, schema[o].type));
		});
		rows.push(row);
	});
	return rows;
};

const getDbConnection = async (tableName, dbDataDir) => {
	if (!connectionPool[tableName]) {
		if (!fs.existsSync(dbDataDir)) fs.mkdirSync(dbDataDir, { recursive: true });
		connectionPool[tableName] = await createDbConnection(dbDataDir, tableName);
	}

	const knex = connectionPool[tableName];
	return knex;
};

const createTableIfNotExists = async (tableName, tableConfig) => {
	if (!tablePool[tableName]) {
		logger.info(`Creating schema for ${tableName}`);
		const knex = await getDbConnection(tableName);
		await loadSchema(knex, tableName, tableConfig);
		tablePool[tableName] = true;
	}
};

const startDbTransaction = async connection => connection.transaction();

const commitDbTransaction = async transaction => transaction.commit();

const rollbackDbTransaction = async transaction => transaction.rollback();

const getTableInstance = async (tableName, tableConfig, dbDataDir = config.dbDataDir) => {
	const { primaryKey, schema } = tableConfig;

	const knex = await getDbConnection(tableName, dbDataDir);

	const createDefaultTransaction = async connection => startDbTransaction(connection);

	await createTableIfNotExists(tableName, tableConfig);

	const upsert = async (inputRows, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		let rawRows = inputRows;
		if (!Array.isArray(rawRows)) rawRows = [inputRows];
		const rows = await mapRowsBySchema(rawRows, schema);

		// Create all queries for `INSERT or UPDATE on Duplicate keys`
		const queries = rows.map(row => knex(tableName)
			.transacting(trx)
			.insert(row)
			.onConflict(primaryKey)
			.merge(),
		);

		// Perform all queries within a batch together
		if (isDefaultTrx) return Promise.all(queries)
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
		return Promise.all(queries);
	};

	const queryBuilder = (params, columns, trx) => {
		const query = knex(tableName).transacting(trx);
		const queryParams = resolveQueryParams(params);

		if (columns) query.select(columns);
		query.where(queryParams);

		if (params.propBetweens) {
			const { propBetweens } = params;
			propBetweens.forEach(
				propBetween => {
					if ('from' in propBetween) query.where(propBetween.property, '>=', propBetween.from);
					if ('to' in propBetween) query.where(propBetween.property, '<=', propBetween.to);
					if ('greaterThan' in propBetween) query.where(propBetween.property, '>', propBetween.greaterThan);
					if ('lowerThan' in propBetween) query.where(propBetween.property, '<', propBetween.lowerThan);
				});
		}

		if (params.sort) {
			const [sortProp, sortOrder] = params.sort.split(':');
			query.orderBy(sortProp, sortOrder);
			query.whereNotNull(sortProp);
		}

		if (params.whereIn) {
			const { property, values } = params.whereIn;
			query.whereIn(property, values);
		}

		if (params.whereJsonSupersetOf) {
			const { property, values } = params.whereJsonSupersetOf;
			query.where(function () {
				const [val0, ...remValues] = Array.isArray(values) ? values : [values];
				this.whereJsonSupersetOf(property, val0);
				remValues.forEach(value => this.orWhere(function () {
					this.whereJsonSupersetOf(property, value);
				}));
			});
		}

		if (params.andWhere) {
			const { andWhere } = params;
			query.where(function () {
				this.where(andWhere);
			});
		}

		if (params.orWhere) {
			const { orWhere, orWhereWith } = params;
			query.where(function () {
				this.where(orWhere).orWhere(orWhereWith);
			});
		}

		if (params.orWhereIn) {
			const { property, values } = params.orWhereIn;
			query.orWhereIn(property, values);
		}

		if (params.search) {
			const { property, pattern } = params.search;
			query.where(`${property}`, 'like', `%${pattern}%`);
		}

		if (params.aggregate) {
			query.sum(`${params.aggregate} as total`);
		}

		if (params.limit) {
			query.limit(Number(params.limit));
		} else {
			logger.warn(`No 'limit' set for the query:\n${query.toString()}`);
		}

		if (params.offset) query.offset(Number(params.offset));

		return query;
	};

	const find = async (params = {}, columns) => {
		const trx = await createDefaultTransaction(knex);
		if (!columns) {
			logger.warn(`No SELECT columns specified in the query, returning the '${tableName}' table primary key: '${tableConfig.primaryKey}'`);
			columns = [tableConfig.primaryKey];
		}
		const query = queryBuilder(params, columns, trx);
		const debugSql = query.toSQL().toNative();
		logger.debug(`${debugSql.sql}; bindings: ${debugSql.bindings}`);

		return query
			.then(async response => {
				await trx.commit();
				return response;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
	};

	const deleteByParams = async (params, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const query = queryBuilder(params, tableConfig.primaryKey, trx).del();
		if (isDefaultTrx) return query
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
		return query;
	};

	const deleteByPrimaryKey = async (ids, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		ids = Array.isArray(ids) ? ids : [ids];
		const query = knex(tableName).transacting(trx).whereIn(primaryKey, ids).del();
		if (isDefaultTrx) return query
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
		return query;
	};

	const count = async (params = {}) => {
		const trx = await createDefaultTransaction(knex);
		const query = knex(tableName).transacting(trx).count(`${tableConfig.primaryKey} as count`);
		const queryParams = resolveQueryParams(params);

		query.where(queryParams);

		if (params.propBetweens) {
			const { propBetweens } = params;
			propBetweens.forEach(
				propBetween => {
					if ('from' in propBetween) query.where(propBetween.property, '>=', propBetween.from);
					if ('to' in propBetween) query.where(propBetween.property, '<=', propBetween.to);
					if ('greaterThan' in propBetween) query.where(propBetween.property, '>', propBetween.greaterThan);
					if ('lowerThan' in propBetween) query.where(propBetween.property, '<', propBetween.lowerThan);
				});
		}

		if (params.sort) {
			const [sortProp] = params.sort.split(':');
			query.whereNotNull(sortProp);
		}

		if (params.whereIn) {
			const { property, values } = params.whereIn;
			query.whereIn(property, values);
		}

		if (params.whereJsonSupersetOf) {
			const { property, values } = params.whereJsonSupersetOf;
			query.where(function () {
				const [val0, ...remValues] = Array.isArray(values) ? values : [values];
				this.whereJsonSupersetOf(property, val0);
				remValues.forEach(value => this.orWhere(function () {
					this.whereJsonSupersetOf(property, value);
				}));
			});
		}

		if (params.andWhere) {
			const { andWhere } = params;
			query.where(function () {
				this.where(andWhere);
			});
		}

		if (params.orWhere) {
			const { orWhere, orWhereWith } = params;
			query.where(function () {
				this.where(orWhere).orWhere(orWhereWith);
			});
		}

		if (params.orWhereIn) {
			const { property, values } = params.orWhereIn;
			query.orWhereIn(property, values);
		}

		if (params.search) {
			const { property, pattern } = params.search;
			query.where(`${property}`, 'like', `%${pattern}%`);
		}

		return query
			.then(async result => {
				await trx.commit();
				const [totalCount] = result;
				return totalCount.count;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
	};

	const rawQuery = async queryStatement => {
		const trx = await createDefaultTransaction(knex);
		return trx
			.raw(queryStatement)
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
	};

	const increment = async (params, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const query = knex(tableName)
			.transacting(trx)
			.where(params.where)
			.increment(params.increment);

		if (isDefaultTrx) return query
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
		return query;
	};

	const decrement = async (params, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const query = knex(tableName)
			.transacting(trx)
			.where(params.where)
			.decrement(params.decrement);

		if (isDefaultTrx) return query
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
		return query;
	};

	return {
		upsert,
		find,
		delete: deleteByParams,
		deleteByPrimaryKey,
		count,
		rawQuery,
		increment,
		decrement,
	};
};

module.exports = {
	default: getTableInstance,
	getDbConnection,
	getTableInstance,
	startDbTransaction,
	commitDbTransaction,
	rollbackDbTransaction,
};

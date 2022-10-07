#!/usr/bin/env node
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
const { ServiceBroker } = require('moleculer');
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const accountsIndexSchema = require('../../shared/database/schema/accounts');
const blocksIndexSchema = require('../../shared/database/schema/blocks');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountIndex = () => getTableInstance('accounts', accountsIndexSchema, MYSQL_ENDPOINT);
const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema, MYSQL_ENDPOINT);

const broker = new ServiceBroker({
	transporter: 'redis://localhost:6379/0',
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

describe('Test indexer methods', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe('Connect to indexer and run accounts based process', () => {
		it('Call indexer.indexAllDelegateAccounts', async () => {
			const accountsDB = await getAccountIndex();
			expect(broker.call('indexer.indexAllDelegateAccounts', {})).resolves.not.toThrow();

			const delegateCount = await accountsDB.count({ isDelegate: true });
			expect(delegateCount).toBeGreaterThanOrEqual(233); // Delegate accounts on test blockchain
		});

		it('Call indexer.indexGenesisAccounts', async () => {
			expect(broker.call('indexer.indexGenesisAccounts', {})).resolves.not.toThrow();
		});
	});

	describe('Connect to indexer and run blocks based process', () => {
		it('Call indexer.indexMissingBlocks', async () => {
			expect(broker.call('indexer.indexMissingBlocks', {})).resolves.not.toThrow();
		});

		it('Call indexer.getIndexStatus', async () => {
			const indexStatus = await broker.call('indexer.getIndexStats', {});
			expect(indexStatus).toMatchObject({
				currentChainHeight: expect.any(Number),
				chainLength: expect.any(Number),
				genesisHeight: expect.any(Number),
				numBlocksIndexed: expect.any(Number),
				percentage: expect.any(String),
				lastIndexedBlock: expect.any(Object),
			});
		});

		it('validate block indexing progress', async () => {
			const blocksTable = await getBlocksIndex();
			const blocks = await blocksTable.find();
			expect(blocks.length).toBeGreaterThan(1);
		});
	});
});

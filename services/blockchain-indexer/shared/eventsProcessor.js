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
const MessageQueue = require('bull');
const { Logger, Signals } = require('lisk-service-framework');

const {
	getBlocks,
	performLastBlockUpdate,
	reloadGeneratorsCache,
	reloadDelegateCache,
	getGenerators,
	getNumberOfGenerators,
} = require('./dataService');

const { deleteBlock } = require('./indexer/blockchainIndex');

const config = require('../config');

const logger = Logger();

const eventsQueue = new MessageQueue(
	config.queue.events.name,
	config.endpoints.messageQueue,
	{ defaultJobOptions: config.queue.defaultJobOptions },
);

const newBlockProcessor = async (block) => {
	logger.debug(`New block arrived at height ${block.height}`);
	const response = await getBlocks({ height: block.height });
	await performLastBlockUpdate(response.data[0]);
	Signals.get('newBlock').dispatch(response);
};

const deleteBlockProcessor = async (block) => {
	logger.debug(`Performing updates on delete block event for the block at height: ${block.header.height}`);
	await deleteBlock(block);
	Signals.get('deleteBlock').dispatch({ data: [block] });
};

const newRoundProcessor = async () => {
	logger.debug('Performing updates on new round');
	await reloadDelegateCache();
	await reloadGeneratorsCache();
	const limit = await getNumberOfGenerators();
	const generators = await getGenerators({ limit, offset: 0 });
	const response = { generators: generators.data.map(generator => generator.address) };
	Signals.get('newRound').dispatch(response);
};

const initEventsProcess = async () => {
	eventsQueue.process(async (job) => {
		logger.debug('Subscribed to events');
		const { isNewBlock, isDeleteBlock, isNewRound } = job.data;

		if (isNewBlock) {
			const { blockHeader } = job.data;
			await newBlockProcessor(blockHeader);
		} else if (isDeleteBlock) {
			const { blockHeader } = job.data;
			await deleteBlockProcessor(blockHeader);
		} else if (isNewRound) await newRoundProcessor();
	});
};

module.exports = {
	initEventsProcess,
};
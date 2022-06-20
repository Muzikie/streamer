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
const { getAddressFromPublicKey } = require('@liskhq/lisk-cryptography');
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const { getBase32AddressFromHex } = require('../utils/accountUtils');

const votesIndexSchema = require('../database/schema/votes');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getVotesIndex = () => getTableInstance('votes', votesIndexSchema, MYSQL_ENDPOINT);

const dposModuleID = 5;
const voteTransactionAssetID = 1;

const extractAddressFromPublicKey = pk => (getAddressFromPublicKey(Buffer.from(pk, 'hex'))).toString('hex');

const getVoteIndexingInfo = async (blocks) => {
	const votesDB = await getVotesIndex();
	const votesToAggregateArray = [];
	const votesMultiArray = blocks.map(block => {
		const votesArray = block.payload
			.filter(tx => tx.moduleID === dposModuleID && tx.assetID === voteTransactionAssetID)
			.map(tx => {
				const voteEntries = tx.asset.votes.map(async vote => {
					const voteEntry = {};

					voteEntry.sentAddress = getBase32AddressFromHex(
						extractAddressFromPublicKey(tx.senderPublicKey),
					);
					voteEntry.receivedAddress = getBase32AddressFromHex(vote.delegateAddress);
					voteEntry.amount = vote.amount;
					voteEntry.timestamp = block.timestamp;

					const [row] = await votesDB.find({
						id: tx.id,
						receivedAddress: voteEntry.receivedAddress,
						limit: 1,
					}, ['isAggregated']);
					if (!row || !row.isAggregated) {
						votesToAggregateArray.push({
							amount: BigInt(vote.amount),
							id: voteEntry.receivedAddress.concat(voteEntry.sentAddress),
							voteObject: {
								...voteEntry,
								id: voteEntry.receivedAddress.concat(voteEntry.sentAddress),
							},
						});
					}

					// TODO: Remove 'tempId' after composite PK support is added
					// Only for indexing all votes
					voteEntry.tempId = tx.id.concat('_', voteEntry.receivedAddress);
					voteEntry.id = tx.id;
					return voteEntry;
				});
				return voteEntries;
			});
		let votes = [];
		votesArray.forEach(arr => votes = votes.concat(arr));
		return votes;
	});
	let allVotePromises = [];
	votesMultiArray.forEach(votes => allVotePromises = allVotePromises.concat(votes));
	const votes = await BluebirdPromise.all(allVotePromises);
	return { votes, votesToAggregateArray };
};

module.exports = {
	getVoteIndexingInfo,
};
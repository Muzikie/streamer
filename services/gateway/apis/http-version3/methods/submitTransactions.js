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
const submitTransactionsSource = require('../../../sources/version3/submitTransactions');
const { getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/transactions/submit',
	httpMethod: 'POST',
	rpcMethod: 'submit.transactions', // not this
	tags: ['Transactions'],
	params: {
		file: { optional: true, type: 'multipart' },
	},
	get schema() {
		const submitTransactionSchema = {};
		submitTransactionSchema[this.swaggerApiPath] = { post: {} };
		submitTransactionSchema[this.swaggerApiPath].post.tags = this.tags;
		submitTransactionSchema[this.swaggerApiPath].post.summary = 'Submit transactions';
		submitTransactionSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Submit transactions and return transactionID',
		});
		submitTransactionSchema[this.swaggerApiPath].post.parameters = [];
		submitTransactionSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Broadcast transaction',
				schema: {
					$ref: '#/definitions/postTransactionWithEnvelope',
				},
			},
			400: {
				description: 'Bad request',
				schema: {
					$ref: '#/definitions/badRequestEnvelope',
				},
			},
			500: {
				description: 'Internal server error',
				schema: {
					$ref: '#/definitions/serverErrorEnvelope',
				},
			},
		};
		return submitTransactionSchema;
	},
	source: submitTransactionsSource,
};

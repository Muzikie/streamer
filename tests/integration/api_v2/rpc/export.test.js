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
const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
	invalidRequestSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	metaSchema,
	exportSchema,
	exportSchemaAccepted,
	goodRequestSchema,
} = require('../../../schemas/api_v2/export.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const requestTransactionExport = async (params) => request(wsRpcUrl, 'get.transactions.export', params);
const requestTransactions = async (params) => request(wsRpcUrl, 'get.transactions', params);

describe('Export API', () => {
	const startDate = '2021-01-10';
	const endDate = '2021-11-30';
	let refTransaction;
	beforeAll(async () => {
		const response = await requestTransactions({ limit: 1 });
		[refTransaction] = response.result.data;
	});

	describe('Schedule file export', () => {
		it('Schedule file export -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await requestTransactionExport({
				address: refTransaction.sender.address,
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchema);
			expect(result.data).toMap(exportSchemaAccepted);
			expect(result.meta).toMap(metaSchema);
			expect(result.meta).toEqual(expect.objectContaining(expected));
		});

		it('Schedule file export -> return INVALID_REQUEST when no address', async () => {
			const response = await requestTransactionExport();
			expect(response).toMap(invalidRequestSchema);
		});

		it('Schedule file export -> return INVALID_PARAMS when invalid address', async () => {
			const response = await requestTransactionExport({
				address: 'lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('Schedule file export -> return INVALID_PARAMS when invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await requestTransactionExport({
				address: refTransaction.sender.address,
				interval: invalidInterval,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('File is ready to export -> return 200 OK', async () => {
			// Add delay of 10 seconds
			await new Promise(resolve => setTimeout(resolve, 10000));

			const expected = { ready: true };
			const response = await requestTransactionExport({
				address: refTransaction.sender.address,
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchema);
			expect(result.data).toMap(exportSchema);
			expect(result.meta).toMap(metaSchema);
			expect(result.meta).toEqual(expect.objectContaining(expected));
		});
	});
});

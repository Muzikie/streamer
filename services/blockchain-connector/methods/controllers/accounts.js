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
const actions = require('../../shared/app/sdk_v5/actions');

const getAccount = async ({ address }) => actions.getAccount(address);

const getAccounts = async ({ addresses }) => actions.getAccounts(addresses);

module.exports = {
	getAccount,
	getAccounts,
};

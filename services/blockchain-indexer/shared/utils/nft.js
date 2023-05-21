const { createHash } = require('crypto');
const { codec } = require('@liskhq/lisk-codec');
const { baseTransactionSchema } = require('@liskhq/lisk-transactions');

const getEntityID = (transaction) => {
	const txBytes = codec.encode(baseTransactionSchema, transaction);
	return createHash('md5').update(txBytes).digest();
};

module.exports = {
	getEntityID,
};

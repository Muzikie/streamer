const collectionsSource = require('../../../sources/version3/collections');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/collections',
	rpcMethod: 'get.collections',
	tags: ['Collections'],
	params: {
		creatorAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		collectionID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		search: { optional: true, type: 'string' },
	},
	get schema() {
		const collectionSchema = {};
		collectionSchema[this.swaggerApiPath] = { get: {} };
		collectionSchema[this.swaggerApiPath].get.tags = this.tags;
		collectionSchema[this.swaggerApiPath].get.summary = 'Requests collections data';
		collectionSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns collections data',
		});
		collectionSchema[this.swaggerApiPath].get.parameters = transformParams('collections', this.params);
		collectionSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of collections',
				schema: {
					$ref: '#/definitions/collectionsWithEnvelope',
				},
			},
		};
		Object.assign(collectionSchema[this.swaggerApiPath].get.responses, response);
		return collectionSchema;
	},
	source: collectionsSource,
	envelope,
};

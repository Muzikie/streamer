const audiosSource = require('../../../sources/version3/audios');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/audios',
	rpcMethod: 'get.audios',
	tags: ['Audios'],
	params: {
		creatorAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		audioID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		collectionID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		ownerAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		search: { optional: true, type: 'string' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const audioSchema = {};
		audioSchema[this.swaggerApiPath] = { get: {} };
		audioSchema[this.swaggerApiPath].get.tags = this.tags;
		audioSchema[this.swaggerApiPath].get.summary = 'Requests audios data';
		audioSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns audios data',
		});
		audioSchema[this.swaggerApiPath].get.parameters = transformParams('audios', this.params);
		audioSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of audios',
				schema: {
					$ref: '#/definitions/audiosWithEnvelope',
				},
			},
		};
		Object.assign(audioSchema[this.swaggerApiPath].get.responses, response);
		return audioSchema;
	},
	source: audiosSource,
	envelope,
};

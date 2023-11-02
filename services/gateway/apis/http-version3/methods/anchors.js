const anchorsSource = require('../../../sources/version3/anchors');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/anchors',
	rpcMethod: 'get.anchors',
	tags: ['Anchors'],
	params: {
		submitter: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		anchorID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.MD5 },
		search: { optional: true, type: 'string' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const anchorSchema = {};
		anchorSchema[this.swaggerApiPath] = { get: {} };
		anchorSchema[this.swaggerApiPath].get.tags = this.tags;
		anchorSchema[this.swaggerApiPath].get.summary = 'Requests anchors data';
		anchorSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns anchors data',
		});
		anchorSchema[this.swaggerApiPath].get.parameters = transformParams('anchors', this.params);
		anchorSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of anchors',
				schema: {
					$ref: '#/definitions/anchorsWithEnvelope',
				},
			},
		};
		Object.assign(anchorSchema[this.swaggerApiPath].get.responses, response);
		return anchorSchema;
	},
	source: anchorsSource,
	envelope,
};

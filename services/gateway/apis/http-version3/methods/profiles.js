const profilesSource = require('../../../sources/version3/profiles');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/profiles',
	rpcMethod: 'get.profiles',
	tags: ['Profiles'],
	params: {
		creatorAddress: { optional: true, type: 'string', min: 3, max: 41, pattern: regex.ADDRESS_LISK32 },
		profileID: { optional: true, type: 'string', min: 1, max: 64, pattern: regex.HASH_SHA256 },
		name: { optional: true, type: 'string', min: 3, max: 50, pattern: /^[A-Za-z0-9\s]{3,50}$/ },
		nickName: { optional: true, type: 'string', pattern: /^[\w\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{3,20}$/ },
		search: { optional: true, type: 'string' },
	},
	get schema() {
		const profileSchema = {};
		profileSchema[this.swaggerApiPath] = { get: {} };
		profileSchema[this.swaggerApiPath].get.tags = this.tags;
		profileSchema[this.swaggerApiPath].get.summary = 'Requests profiles data';
		profileSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns profiles data',
		});
		profileSchema[this.swaggerApiPath].get.parameters = transformParams('profiles', this.params);
		profileSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of profiles',
				schema: {
					$ref: '#/definitions/profilesWithEnvelope',
				},
			},
		};
		Object.assign(profileSchema[this.swaggerApiPath].get.responses, response);
		return profileSchema;
	},
	source: profilesSource,
	envelope,
};

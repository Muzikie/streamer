const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const transactionsIndexSchema = require('../../database/schema/audios');
const collectionsIndexSchema = require('../../database/schema/collections');
const ownersIndexSchema = require('../../database/schema/owners');
const fitsIndexSchema = require('../../database/schema/fits');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAudiosIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getCollectionsIndex = () => getTableInstance(
	collectionsIndexSchema.tableName,
	collectionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getOwnersIndex = () => getTableInstance(
	ownersIndexSchema.tableName,
	ownersIndexSchema,
	MYSQL_ENDPOINT,
);

const getFitsIndex = () => getTableInstance(
	fitsIndexSchema.tableName,
	fitsIndexSchema,
	MYSQL_ENDPOINT,
);

const getAudios = async (params = {}) => {
	const audiosTable = await getAudiosIndex();
	const collectionsTable = await getCollectionsIndex();
	const ownersTable = await getOwnersIndex();
	const fitsTable = await getFitsIndex();

	const total = await audiosTable.count(params);
	const audioData = await audiosTable.find(
		{ ...params, limit: params.limit || total },
		['audioID', 'creatorAddress', 'name', 'releaseYear', 'collectionID'],
	);

	const data = await BluebirdPromise.map(
		audioData,
		async (audio) => {
			const collectionData = await collectionsTable.find(
				{ collectionID: audio.collectionID },
				['name', 'collectionType', 'releaseYear'],
			);

			const ownersData = await ownersTable.find(
				{ audioID: audio.audioID },
				['address', 'shared', 'income'],
			);

			const fitData = await fitsTable.find(
				{ audioID: audio.audioID },
				['address', 'shared', 'income'],
			);

			return {
				...audio,
				collection: collectionData,
				owners: ownersData,
				fit: fitData,
			};
		},
		{ concurrency: audioData.length },
	);

	const result = {
		data,
		meta: {
			count: data.length,
			offset: parseInt(params.offset, 10) || 0,
			total,
		},
	};
	return result;
};

module.exports = {
	getAudios,
};

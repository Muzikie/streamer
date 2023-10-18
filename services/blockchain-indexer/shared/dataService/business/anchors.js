const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const transactionsIndexSchema = require('../../database/schema/anchors');
const imagesIndexSchema = require('../../database/schema/images');
const votesIndexSchema = require('../../database/schema/votes');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAnchorsIndex = () => getTableInstance(
	transactionsIndexSchema.tableName,
	transactionsIndexSchema,
	MYSQL_ENDPOINT,
);

const getImagesIndex = () => getTableInstance(
	imagesIndexSchema.tableName,
	imagesIndexSchema,
	MYSQL_ENDPOINT,
);

const getVotesIndex = () => getTableInstance(
	votesIndexSchema.tableName,
	votesIndexSchema,
	MYSQL_ENDPOINT,
);

const getAnchors = async (params = {}) => {
	const anchorsTable = await getAnchorsIndex();
	const imagesTable = await getImagesIndex();
	const votesTable = await getVotesIndex();

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'name',
			pattern: search,
		};
	}

	const anchorData = await anchorsTable.find(
		{ ...params, limit: params.limit },
		['anchorID', 'name', 'album', 'artists', 'spotifyId', 'appleMusicId', 'createdAt', 'submitter'],
	);
	const total = anchorData.length;

	const data = await BluebirdPromise.map(
		anchorData,
		async (anchor) => {
			const imagesData = await imagesTable.find(
				{ anchorID: anchor.anchorID },
				['url', 'width', 'height'],
			);

			const votesData = await votesTable.find(
				{ anchorID: anchor.anchorID },
				['senderAddress'],
			);

			return {
				...anchor,
				images: imagesData,
				votes: votesData,
			};
		},
		{ concurrency: anchorData.length },
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
	getAnchors,
};

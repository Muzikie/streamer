const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const transactionsIndexSchema = require('../../database/schema/anchors');
const imagesIndexSchema = require('../../database/schema/images');
const votesIndexSchema = require('../../database/schema/votes');
const badgesIndexSchema = require('../../database/schema/badges');
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

const getBadgesIndex = () => getTableInstance(
	badgesIndexSchema.tableName,
	badgesIndexSchema,
	MYSQL_ENDPOINT,
);

const getAnchors = async (params = {}) => {
	const anchorsTable = await getAnchorsIndex();
	const imagesTable = await getImagesIndex();
	const votesTable = await getVotesIndex();
	const badgesTable = await getBadgesIndex();

	let anchorData = [];

	const { winner, ...restParams } = params;

	if (winner !== undefined) {
		const response = await badgesTable.find(
			{ ...restParams, limit: restParams.limit || 10 },
			['anchorID'],
		);

		const anchorIDs = response.map((badge) => badge.anchorID).filter(badgeID => badgeID);

		const res = await BluebirdPromise.map(
			anchorIDs,
			async (anchorID) => {
				const anchorsData = await anchorsTable.find(
					{ anchorID },
					['anchorID', 'name', 'album', 'artists', 'spotifyId', 'appleMusicId', 'createdAt', 'submitter'],
				);
				return anchorsData.length ? anchorsData[0] : null;
			},
			{ concurrency: anchorIDs.length },
		);
		anchorData = res.filter(anchor => anchor);
	} else {
		if (restParams.search) {
			const { search, ...remParams } = restParams;
			params = remParams;

			params.search = {
				property: 'name',
				pattern: search,
			};
		}

		anchorData = await anchorsTable.find(
			{ ...params, limit: params.limit || 10 },
			['anchorID', 'name', 'album', 'artists', 'spotifyId', 'appleMusicId', 'createdAt', 'submitter'],
		);
	}

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

const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const transactionsIndexSchema = require('../../database/schema/anchors');
const imagesIndexSchema = require('../../database/schema/images');
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

const getAnchors = async (params = {}) => {
	const anchorsTable = await getAnchorsIndex();
	const imagesTable = await getImagesIndex();

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'name',
			pattern: search,
		};
	}

	let anchorData = [];

	if (params.submitter) {
		// anchorsID
		const anchorIDs = await imagesTable.find(
			{ address: params.submitter, limit: params.limit },
			['anchorID', 'shares'],
		);

		const filteredAnchorIDs = anchorIDs.filter(anchor => anchor.shares > 0);

		anchorData = await BluebirdPromise.map(
			filteredAnchorIDs,
			async (anchorID) => {
				const anchor = await anchorsTable.find(
					{ anchorID: anchorID.anchorID },
					['anchorID', 'submitter', 'name', 'album', 'artists', 'spotifyId', 'appleMusicId'],
				);

				return anchor[0];
			},
			{ concurrency: filteredAnchorIDs.length },
		);
	} else {
		anchorData = await anchorsTable.find(
			{ ...params, limit: params.limit },
			['anchorID', 'submitter', 'name', 'album', 'artists', 'spotifyId', 'appleMusicId'],
		);
	}

	const total = anchorData.length;

	const data = await BluebirdPromise.map(
		anchorData,
		async (anchor) => {
			const imagesData = await imagesTable.find(
				{ anchorID: anchor.anchorID },
				['address', 'shares', 'income'],
			);

			return {
				...anchor,
				images: imagesData,
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

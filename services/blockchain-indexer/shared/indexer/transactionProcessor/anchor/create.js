const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const accountsTableSchema = require('../../../database/schema/accounts');
const anchorsTableSchema = require('../../../database/schema/anchors');
const imagesTableSchema = require('../../../database/schema/images');
const badgesTableSchema = require('../../../database/schema/badges');
const {
	MODULE_NAME_ANCHOR,
	EVENT_NAME_ANCHOR_CREATED,
	EVENT_NAME_COMMAND_EXECUTION_RESULT,
} = require('../../../../../blockchain-connector/shared/sdk/constants/names');

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT,
);

const getAnchorsTable = () => getTableInstance(
	anchorsTableSchema.tableName,
	anchorsTableSchema,
	MYSQL_ENDPOINT,
);

const getImagesTable = () => getTableInstance(
	imagesTableSchema.tableName,
	imagesTableSchema,
	MYSQL_ENDPOINT,
);

const getBadgesTable = () => getTableInstance(
	badgesTableSchema.tableName,
	badgesTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'create';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	// Do not process failed transactions
	const { data: commandExecutedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_COMMAND_EXECUTION_RESULT,
	);
	if (!commandExecutedData.success) {
		return false;
	}

	const accountsTable = await getAccountsTable();
	const anchorsTable = await getAnchorsTable();
	const imagesTable = await getImagesTable();
	const badgesTable = await getBadgesTable();

	// Use event data to get anchorID
	const eventData = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_ANCHOR_CREATED,
	);
	const { data: anchorCreatedData } = eventData || { data: {} };

	const senderAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);

	// Store a record of the sender account
	const account = {
		address: senderAddress,
	};

	logger.trace(`Updating account index for the account with address ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	// Store images
	await BluebirdPromise.map(
		tx.params.images,
		async image => {
			const imageInfo = {
				...image,
				anchorID: anchorCreatedData.anchorID,
			};
			logger.trace(`Updating image index for the account with address ${image.address}.`);
			await imagesTable.upsert(imageInfo, dbTrx);
			logger.debug(`Updated image index for the account with address ${image.address}.`);
			return true;
		},
		{ concurrency: tx.params.images.length },
	);

	logger.trace(`Updating images index for the anchor with anchorID ${account.address}.`);
	await accountsTable.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}.`);

	logger.trace(`Indexing anchors with address ${account.address}.`);

	// And finally, store the anchor
	const anchorsNFT = {
		...anchorCreatedData,
		...tx.params,
		votes: [],
	};

	await anchorsTable.upsert(anchorsNFT, dbTrx);
	logger.debug(`Indexed anchor with ID ${anchorCreatedData.anchorID}.`);

	const badge = await badgesTable.find({ badgeID: anchorCreatedData.badgeIDs[0] });
	if (!badge.length) {
		await BluebirdPromise.map(
			anchorCreatedData.badgeIDs,
			async (badgeID, index) => {
				const badgeInfo = {
					badgeID,
					anchorID: '',
					awardedTo: '',
					type: 'anchor_of_the_day',
					awardDate: anchorCreatedData.createdAt,
					rank: BigInt(index + 1),
					prize: BigInt(0),
					claimed: false,
				};
				logger.trace(`Updating badge index for the badgeID ${badgeID}.`);
				await badgesTable.upsert(badgeInfo, dbTrx);
				logger.debug(`Updated badge index for the badgeID ${badgeID}.`);
				return true;
			},
			{ concurrency: anchorCreatedData.badgeIDs.length },
		);
	}
	return true;
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const anchorsTable = await getAnchorsTable();
	const imagesTable = await getImagesTable();

	const { data: anchorCreatedData = {} } = events.find(
		({ module, name }) => module === MODULE_NAME_ANCHOR
			&& name === EVENT_NAME_ANCHOR_CREATED,
	);

	logger.trace(`Deleting images corresponding the anchor ID ${anchorCreatedData.anchorID}.`);
	await imagesTable.delete({ anchorID: anchorCreatedData.anchorID }, dbTrx);
	logger.trace(`Deleted images corresponding the anchor ID ${anchorCreatedData.anchorID}.`);

	logger.trace(`Removing anchor entry for ID ${anchorCreatedData.anchorID}.`);
	await anchorsTable.deleteByPrimaryKey(anchorCreatedData.anchorID, dbTrx);
	logger.debug(`Removed anchor entry for ID ${anchorCreatedData.anchorID}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};

/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import Joi from 'joi';

const regex = {
	address: /^lsk[a-hjkm-z2-9]{38}$/,
	publicKey: /^([A-Fa-f0-9]{2}){32}$/,
	interval: /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/,
	fileName: /^\btransactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv\b$/,
	fileUrl: /^\/api\/v2\/exports\/transactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv$/,
};

const exportSchemaAccepted = {
	address: Joi.string().pattern(regex.address).required(),
	publicKey: Joi.string().pattern(regex.publicKey).optional(),
	interval: Joi.string().pattern(regex.interval).required(),
};
const exportSchema = {
	...exportSchemaAccepted,
	fileName: Joi.string().pattern(regex.fileName).required(),
	fileUrl: Joi.string().pattern(regex.fileUrl).required(),
};

const metaSchema = {
	ready: Joi.boolean().required(),
};

const goodRequestSchema = {
	data: Joi.object().required(),
	meta: Joi.object(metaSchema).required(),
	links: Joi.object().optional(),
};

module.exports = {
	exportSchema: Joi.object(exportSchema).required(),
	exportSchemaAccepted: Joi.object(exportSchemaAccepted).required(),
	metaSchema: Joi.object(metaSchema).required(),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
};
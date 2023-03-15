const au = require('../modules/util/authUtil');
const rm = require('../modules/util/responseMessage');
const sc = require('../modules/util/statusCode');
const pool = require('../modules/db/pool');

module.exports = {
    insert: async (title, description, imageUrl, email, walletLists, collectionContentUri, nftItemContentBaseUri) => {
        const data = `'${title}', '${description}', '${imageUrl}', '${email}', '${false}', '${collectionContentUri}', '${nftItemContentBaseUri}'`;
        const query = `INSERT INTO Badge (title, description, imageUrl, email, isApproved, collectionContentUri, nftItemContentBaseUri) VALUES (${data});`
        const [result] = await pool.queryParam(query);
        const insertId = result.insertId;
        walletLists.map(async (address) => {
            const query = `INSERT INTO BadgeWallet (address, badgeId) VALUES ('${address}', '${insertId}');`
            const [result] = await pool.queryParam(query);
        })
        // running
        if (!result) {
            return {
                code: sc.BAD_REQUEST,
                json: au.successFalse(rm.BADGE_CREATE_FAIL)
            };
        }
        return {
            code: sc.OK,
            json: au.successTrue(rm.BADGE_CREATE_SUCCESS, result)
        }
    },
    listBadges: async (walletAddress) => {
        const query = `
        SELECT b.id, b.title, b.description, b.imageUrl, b.nftItemContentBaseUri, b.mintAmount,
        CASE
            WHEN bw.address = '${walletAddress}' THEN 1
            ELSE 0
        END AS isWhiteListed
        FROM Badge b
        JOIN BadgeWallet bw ON b.id = bw.badgeId
        GROUP BY b.id`;
        let [result] = await pool.queryParam(query);
        if (!result) {
            return {
                code: sc.BAD_REQUEST,
                json: au.successFalse(rm.BADGE_READ_ALL_FAIL)
            };
        }
        return {
            code: sc.OK,
            json: au.successTrue(rm.BADGE_READ_ALL_SUCCESS, result)
        }
    },
    getBadgeInfoById: async (id) => {
        const query = `
        SELECT * FROM Badge WHERE id = ${id}
        `
        let [result] = await pool.queryParam(query);
        if (!result) {
            return {
                code: sc.BAD_REQUEST,
                json: au.successFalse(rm.BADGE_READ_ID_FAIL)
            };
        }
        return {
            code: sc.OK,
            json: au.successTrue(rm.BADGE_READ_ID_SUCCESS, result)
        }
    },
    mintBadge: async (id) => {
        const query = `UPDATE Badge SET mintAmount = mintAmount + 1 WHERE id = ${id}`
        let [result] = await pool.queryParam(query);
        if (!result) {
            return {
                code: sc.BAD_REQUEST,
                json: au.successFalse(rm.BADGE_UPDATE_FAIL)
            };
        }
        return {
            code: sc.OK,
            json: au.successTrue(rm.BADGE_UPDATE_SUCCESS, result)
        }
    }
}
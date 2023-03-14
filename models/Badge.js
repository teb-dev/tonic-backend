const au = require('../modules/util/authUtil');
const rm = require('../modules/util/responseMessage');
const sc = require('../modules/util/statusCode');
const pool = require('../modules/db/pool');

module.exports = {
    insert: async (title, description, imageUrl, email, walletLists) => {
        const data = `'${title}', '${description}', '${imageUrl}', '${email}', ${false}`
        const query = `INSERT INTO Badge (title, description, imageUrl, email, isApproved) VALUES (${data});`
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
        SELECT b.id, b.title, b.description, b.imageUrl, 
        IF(COUNT(IF(bw.address='${walletAddress}', 1, NULL)) > 0, true, false) AS isWhiteListed
        FROM Badge b
        JOIN BadgeWallet bw ON b.id = bw.badgeId
        GROUP BY b.id`;
        let [result] = await pool.queryParam(query);
        if (!result) {
            return {
                code: sc.BAD_REQUEST,
                json: au.successFalse(rm.B)
            };
        }
        return {
            code: sc.OK,
            json: au.successTrue(rm.LOUNGE_READ_ALL_SUCCESS, result)
        }
    },
}
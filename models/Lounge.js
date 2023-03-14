const au = require('../modules/util/authUtil');
const rm = require('../modules/util/responseMessage');
const sc = require('../modules/util/statusCode');
const pool = require('../modules/db/pool');

module.exports = {
    insert: async (title, description, imageUrl, redirectUrl, requirements) => {
        const data = `'${title}', '${description}', '${imageUrl}', '${redirectUrl}', ${false}`
        const query = `INSERT INTO lounges (title, description, imageUrl, redirectUrl, isApproved) VALUES (${data});`
        const [result] = await pool.queryParam(query);
        const insertId = result.insertId;
        requirements.map(async (filter) => {
            console.log(filter);
            const query = `INSERT INTO lounge_requirements (type, loungeId, address, amount) VALUES ('${filter.type}', '${insertId}', '${filter.address}', '${filter.amount}');`
            const [result] = await pool.queryParam(query);
        })
        // running
        if (!result) {
            return {
                code: sc.BAD_REQUEST,
                json: au.successFalse(rm.LOUNGE_CREATE_FAIL)
            };
        }
        return {
            code: sc.OK,
            json: au.successTrue(rm.LOUNGE_CREATE_SUCCESS, result)
        }
    },
    listLounges: async (page) => {
        const perPage = 5; // Number of items per page
        const offset = (page - 1) * perPage; // Calculate the starting row number

        const query = `
        SELECT lounges.id, lounges.title, lounges.description, lounges.imageUrl, lounges.redirectUrl,
        JSON_ARRAYAGG(JSON_OBJECT('type', lounge_requirements.type, 'address', lounge_requirements.address, 'amount', lounge_requirements.amount)) AS requirements
        FROM lounges    
        JOIN lounge_requirements ON lounges.id = lounge_requirements.loungeId
        GROUP BY lounges.id
        LIMIT ${perPage} OFFSET ${offset};`;
        let [result] = await pool.queryParam(query);
            if (!result) {
                return {
                    code: sc.BAD_REQUEST,
                    json: au.successFalse(rm.LOUNGE_READ_ALL_FAIL)
                };
            }
            return {
                code: sc.OK,
                json: au.successTrue(rm.LOUNGE_READ_ALL_SUCCESS, result)
            }
    },

}
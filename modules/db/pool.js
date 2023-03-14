const { connect } = require("pm2");
const poolPromise = require('../../config/database');

module.exports = {
    queryParam: async (query) => {
        return new Promise ( async (resolve, reject) => {
            try {
               /* Connection Pool을 생성! */
                const pool = await poolPromise;
               /* Connection을 생성! */
                const connection = await pool.getConnection();
                try {
                  /* 전달받은 query를 실행 */
                    const result = await connection.query(query);
                  /* Connection 할당 해제 */
                    await connection.release();
                  /* 결과 반환 */
                    resolve(result);
                } catch (err) {
                    await connection.release();
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    queryParamArr: async (query, value) => {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise;
                const connection = await pool.getConnection();
                try {
                    /* query와 필요한 value를 함께 전달 - 차이점 */
                    const result = await connection.query(query, value);
                    await connection.release();
                    resolve(result);
                } catch (err) {
                    await connection.release();
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    Transaction: async (...args) => {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise;
                const connection = await pool.getConnection();
                try {
                    await connection.beginTransaction();
                    args.forEach(async (it) => await it(connection));
                    await connection.commit();
                    await connection.release();
                    resolve(result);
                } catch (err) {
                    await connection.rollback()
                    await connection.release();
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}
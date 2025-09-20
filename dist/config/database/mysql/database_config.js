import mysql from 'mysql2/promise';
const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_DATABASE,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    waitForConnections: true,
});
export const query = async (sql, parms) => {
    const [rows] = await pool.query(sql, parms);
    return rows;
};
export default pool;
//# sourceMappingURL=database_config.js.map
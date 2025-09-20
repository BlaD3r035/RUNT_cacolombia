import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const query: (sql: string, parms: Array<String>) => Promise<mysql.QueryResult>;
export default pool;
//# sourceMappingURL=database_config.d.ts.map
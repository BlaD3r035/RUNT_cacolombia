import mysql, { RowDataPacket } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST as string,
  database: process.env.DATABASE_NAME as string,
  user: process.env.DATABASE_USER as string,
  password: process.env.DATABASE_PASSWORD as string,
  port: 3306,
  waitForConnections: true,
})

export async function query<T extends RowDataPacket[] = RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const [rows] = await pool.query<T>(sql, params)
  return rows
}

const testConnection = async () => {
  try {
    await pool.query('SELECT 1')
    console.log('✅ Conexión a la base de datos exitosa')
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error)
    process.exit(1) 
  }
}

testConnection()

export default pool

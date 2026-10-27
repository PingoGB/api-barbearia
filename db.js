import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    port: 5432,
    password: process.env.DB_PASSWORD,
    database: "barbearia_db"
})

export default pool
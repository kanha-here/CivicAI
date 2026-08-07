import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

// Use a Pool for better performance in a web backend
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon's secure connection
    }
});

export const query = (text, params) => pool.query(text, params);

// Test the connection immediately
export const connectDB = async () => {
    try {
        const res = await query('SELECT NOW()');
        console.log('✅ grievance.ai successfully connected to Neon at:', res.rows[0].now);
    } catch (err) {
        console.error('❌ Connection error:', err.stack);
    }
}

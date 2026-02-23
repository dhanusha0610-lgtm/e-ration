const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("Please set DATABASE_URL environment variable.");
    process.exit(1);
}

const sql = neon(connectionString);

async function main() {
    console.log('Running database setup...');
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS queue_bookings (
        id SERIAL PRIMARY KEY,
        consumer_id INTEGER REFERENCES consumers(id),
        shop_id INTEGER REFERENCES shops(id),
        booking_date DATE NOT NULL,
        qr_code TEXT UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'booked',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('✅ queue_bookings table created successfully or already exists.');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

main();

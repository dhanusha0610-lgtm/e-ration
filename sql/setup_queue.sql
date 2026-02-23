-- Create queue_bookings table
CREATE TABLE IF NOT EXISTS queue_bookings (
  id SERIAL PRIMARY KEY,
  consumer_id INTEGER REFERENCES consumers(id),
  shop_id INTEGER REFERENCES shops(id),
  booking_date DATE NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'booked', -- booked, completed, unused
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

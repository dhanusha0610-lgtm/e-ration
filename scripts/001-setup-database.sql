-- E-Ration Shop Management System Database Schema

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('consumer', 'shop_owner', 'admin')),
  login_id VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  shop_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  owner_user_id INTEGER REFERENCES users(id),
  district VARCHAR(100) NOT NULL DEFAULT 'Central Delhi',
  state VARCHAR(100) NOT NULL DEFAULT 'Delhi',
  open_time VARCHAR(10) NOT NULL DEFAULT '09:00',
  close_time VARCHAR(10) NOT NULL DEFAULT '17:00',
  is_active BOOLEAN DEFAULT true,
  next_issue_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consumers table
CREATE TABLE IF NOT EXISTS consumers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ration_card_number VARCHAR(50) UNIQUE NOT NULL,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('APL', 'BPL', 'AAY', 'PHH')),
  head_of_family VARCHAR(200) NOT NULL,
  family_members INTEGER DEFAULT 1,
  address TEXT NOT NULL,
  phone VARCHAR(15),
  aadhar_number VARCHAR(12),
  assigned_shop_id INTEGER REFERENCES shops(id),
  next_allocation_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock items table
CREATE TABLE IF NOT EXISTS stock_items (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  item_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Grocery',
  quantity_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  consumer_id INTEGER REFERENCES consumers(id),
  shop_id INTEGER REFERENCES shops(id),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  transaction_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed'
);

-- Transaction items
CREATE TABLE IF NOT EXISTS transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  item_name VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  price DECIMAL(10,2) NOT NULL
);

-- Stock requests from shop owners
CREATE TABLE IF NOT EXISTS stock_requests (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id),
  item_name VARCHAR(100) NOT NULL,
  quantity_requested DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  consumer_id INTEGER REFERENCES consumers(id),
  shop_id INTEGER REFERENCES shops(id),
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Ration schedule (upcoming rations info)
CREATE TABLE IF NOT EXISTS ration_schedule (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  card_type VARCHAR(20) NOT NULL,
  issue_date DATE NOT NULL,
  items_description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  target_role VARCHAR(20) DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

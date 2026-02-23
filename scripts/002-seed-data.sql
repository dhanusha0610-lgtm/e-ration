-- Seed data for E-Ration Shop Management System
-- Passwords are stored as plain text for demo (in production, use bcrypt)

-- Admin user
INSERT INTO users (role, login_id, password_hash, name) VALUES
('admin', 'ADMIN001', 'admin123', 'Rajesh Kumar Singh'),
('admin', 'ADMIN002', 'admin123', 'Priya Sharma');

-- Shop owners
INSERT INTO users (role, login_id, password_hash, name) VALUES
('shop_owner', 'SHOP001', 'shop123', 'Ramesh Chandra Gupta'),
('shop_owner', 'SHOP002', 'shop123', 'Sunita Devi Verma'),
('shop_owner', 'SHOP003', 'shop123', 'Manoj Kumar Yadav');

-- Consumer users
INSERT INTO users (role, login_id, password_hash, name) VALUES
('consumer', 'RC-DL-2024-001', 'user123', 'Amit Kumar'),
('consumer', 'RC-DL-2024-002', 'user123', 'Sanjay Sharma'),
('consumer', 'RC-DL-2024-003', 'user123', 'Meena Kumari'),
('consumer', 'RC-DL-2024-004', 'user123', 'Ravi Shankar'),
('consumer', 'RC-DL-2024-005', 'user123', 'Geeta Devi');

-- Shops
INSERT INTO shops (shop_id, name, address, owner_user_id, district, state, open_time, close_time, is_active, next_issue_date) VALUES
('SHOP001', 'Jan Seva Ration Shop', '45, Rajendra Nagar, New Delhi - 110060', 3, 'Central Delhi', 'Delhi', '08:00', '14:00', true, '2026-03-01'),
('SHOP002', 'Bharat Ration Kendra', '12, Laxmi Nagar, East Delhi - 110092', 4, 'East Delhi', 'Delhi', '09:00', '15:00', true, '2026-03-01'),
('SHOP003', 'Desh Seva Fair Price Shop', '78, Dwarka Sector 7, New Delhi - 110075', 5, 'South West Delhi', 'Delhi', '08:30', '13:30', true, '2026-03-05');

-- Consumers
INSERT INTO consumers (user_id, ration_card_number, card_type, head_of_family, family_members, address, phone, aadhar_number, assigned_shop_id, next_allocation_date) VALUES
(6, 'RC-DL-2024-001', 'BPL', 'Amit Kumar', 4, '23, Patel Nagar, New Delhi', '9876543210', '123456789012', 1, '2026-03-01'),
(7, 'RC-DL-2024-002', 'APL', 'Sanjay Sharma', 3, '56, Karol Bagh, New Delhi', '9876543211', '234567890123', 1, '2026-03-01'),
(8, 'RC-DL-2024-003', 'AAY', 'Meena Kumari', 5, '89, Shahdara, East Delhi', '9876543212', '345678901234', 2, '2026-03-01'),
(9, 'RC-DL-2024-004', 'PHH', 'Ravi Shankar', 6, '34, Janakpuri, New Delhi', '9876543213', '456789012345', 3, '2026-03-05'),
(10, 'RC-DL-2024-005', 'BPL', 'Geeta Devi', 2, '67, Dwarka Sector 12, New Delhi', '9876543214', '567890123456', 3, '2026-03-05');

-- Stock items
INSERT INTO stock_items (shop_id, item_name, category, quantity_kg, unit, price_per_unit) VALUES
(1, 'Rice', 'Grain', 500.00, 'kg', 3.00),
(1, 'Wheat', 'Grain', 400.00, 'kg', 2.00),
(1, 'Sugar', 'Grocery', 200.00, 'kg', 13.50),
(1, 'Kerosene Oil', 'Fuel', 150.00, 'litre', 15.00),
(1, 'Dal (Toor)', 'Pulses', 100.00, 'kg', 20.00),
(1, 'Salt', 'Grocery', 80.00, 'kg', 1.00),
(2, 'Rice', 'Grain', 600.00, 'kg', 3.00),
(2, 'Wheat', 'Grain', 350.00, 'kg', 2.00),
(2, 'Sugar', 'Grocery', 180.00, 'kg', 13.50),
(2, 'Kerosene Oil', 'Fuel', 120.00, 'litre', 15.00),
(2, 'Dal (Chana)', 'Pulses', 90.00, 'kg', 18.00),
(3, 'Rice', 'Grain', 450.00, 'kg', 3.00),
(3, 'Wheat', 'Grain', 300.00, 'kg', 2.00),
(3, 'Sugar', 'Grocery', 160.00, 'kg', 13.50),
(3, 'Kerosene Oil', 'Fuel', 100.00, 'litre', 15.00),
(3, 'Dal (Toor)', 'Pulses', 75.00, 'kg', 20.00),
(3, 'Mustard Oil', 'Oil', 50.00, 'litre', 25.00);

-- Transactions
INSERT INTO transactions (consumer_id, shop_id, total_amount, transaction_date, status) VALUES
(1, 1, 85.50, '2026-02-01 10:30:00', 'completed'),
(2, 1, 62.00, '2026-02-01 11:15:00', 'completed'),
(3, 2, 120.00, '2026-02-02 09:45:00', 'completed'),
(4, 3, 95.00, '2026-02-03 10:00:00', 'completed'),
(5, 3, 45.50, '2026-02-03 11:30:00', 'completed'),
(1, 1, 78.00, '2026-01-05 10:00:00', 'completed'),
(2, 1, 55.00, '2026-01-05 11:00:00', 'completed');

-- Transaction items
INSERT INTO transaction_items (transaction_id, item_name, quantity, unit, price) VALUES
(1, 'Rice', 5.00, 'kg', 15.00),
(1, 'Wheat', 10.00, 'kg', 20.00),
(1, 'Sugar', 2.00, 'kg', 27.00),
(1, 'Dal (Toor)', 1.00, 'kg', 20.00),
(2, 'Rice', 5.00, 'kg', 15.00),
(2, 'Wheat', 8.00, 'kg', 16.00),
(2, 'Sugar', 2.00, 'kg', 27.00),
(3, 'Rice', 10.00, 'kg', 30.00),
(3, 'Wheat', 15.00, 'kg', 30.00),
(3, 'Sugar', 3.00, 'kg', 40.50),
(3, 'Dal (Chana)', 1.00, 'kg', 18.00),
(4, 'Rice', 8.00, 'kg', 24.00),
(4, 'Wheat', 10.00, 'kg', 20.00),
(4, 'Sugar', 2.00, 'kg', 27.00),
(4, 'Dal (Toor)', 1.00, 'kg', 20.00),
(5, 'Rice', 3.00, 'kg', 9.00),
(5, 'Sugar', 1.00, 'kg', 13.50),
(5, 'Wheat', 5.00, 'kg', 10.00),
(6, 'Rice', 5.00, 'kg', 15.00),
(6, 'Wheat', 10.00, 'kg', 20.00),
(6, 'Sugar', 2.00, 'kg', 27.00),
(7, 'Rice', 5.00, 'kg', 15.00),
(7, 'Wheat', 8.00, 'kg', 16.00),
(7, 'Sugar', 2.00, 'kg', 27.00);

-- Stock requests
INSERT INTO stock_requests (shop_id, item_name, quantity_requested, unit, status, requested_at) VALUES
(1, 'Rice', 200.00, 'kg', 'pending', '2026-02-15 09:00:00'),
(1, 'Dal (Toor)', 50.00, 'kg', 'approved', '2026-02-10 10:00:00'),
(2, 'Wheat', 150.00, 'kg', 'pending', '2026-02-14 11:00:00'),
(3, 'Sugar', 100.00, 'kg', 'rejected', '2026-02-12 09:30:00');

-- Complaints
INSERT INTO complaints (consumer_id, shop_id, subject, description, status) VALUES
(1, 1, 'Short weight in rice', 'Received only 4.5 kg instead of 5 kg rice in last distribution.', 'open'),
(3, 2, 'Shop closed during working hours', 'Shop was closed on Feb 10 at 10 AM which is working hours.', 'in_progress'),
(4, 3, 'Poor quality sugar', 'Sugar received was of very poor quality and had impurities.', 'resolved');

-- Ration schedule
INSERT INTO ration_schedule (shop_id, card_type, issue_date, items_description, status) VALUES
(1, 'BPL', '2026-03-01', 'Rice: 5kg, Wheat: 10kg, Sugar: 2kg, Dal: 1kg', 'upcoming'),
(1, 'APL', '2026-03-02', 'Rice: 3kg, Wheat: 8kg, Sugar: 1kg', 'upcoming'),
(1, 'AAY', '2026-03-01', 'Rice: 10kg, Wheat: 15kg, Sugar: 3kg, Dal: 2kg, Oil: 1L', 'upcoming'),
(2, 'BPL', '2026-03-01', 'Rice: 5kg, Wheat: 10kg, Sugar: 2kg', 'upcoming'),
(2, 'AAY', '2026-03-01', 'Rice: 10kg, Wheat: 15kg, Sugar: 3kg, Dal: 2kg', 'upcoming'),
(3, 'PHH', '2026-03-05', 'Rice: 7kg, Wheat: 12kg, Sugar: 2kg, Dal: 1kg, Oil: 1L', 'upcoming'),
(3, 'BPL', '2026-03-05', 'Rice: 5kg, Wheat: 10kg, Sugar: 2kg', 'upcoming'),
(1, 'BPL', '2026-02-01', 'Rice: 5kg, Wheat: 10kg, Sugar: 2kg, Dal: 1kg', 'completed'),
(2, 'AAY', '2026-02-02', 'Rice: 10kg, Wheat: 15kg, Sugar: 3kg, Dal: 2kg', 'completed');

-- Announcements
INSERT INTO announcements (title, message, created_by, target_role, is_active) VALUES
('March 2026 Ration Distribution Schedule', 'The ration distribution for March 2026 will commence from 1st March. BPL and AAY card holders will get priority. Please carry your ration card and Aadhar card.', 1, 'all', true),
('New Stock Arrival', 'Fresh stock of Rice, Wheat and Sugar has been allocated to all shops in Central Delhi district. Shop owners can update their inventory.', 1, 'shop_owner', true),
('Festive Bonus Allocation', 'Under the Pradhan Mantri Garib Kalyan Anna Yojana, additional 5kg rice and 5kg wheat will be provided free to all PHH and AAY card holders for the month of March 2026.', 1, 'all', true);

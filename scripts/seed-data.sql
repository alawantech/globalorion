-- Insert admin user
INSERT OR IGNORE INTO users (
    member_id, first_name, last_name, email, phone, password_hash, 
    status, role, activation_date, created_at
) VALUES (
    'BO000001', 
    'Admin', 
    'User', 
    'admin@brightorian.com', 
    '+2348000000000', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'active', 
    'admin', 
    strftime('%s', 'now'),
    strftime('%s', 'now')
);

-- Insert system settings
INSERT OR IGNORE INTO system_settings (setting_key, setting_value) VALUES
('package_price', '36000'),
('min_withdrawal', '5000'),
('level_1_commission', '4000'),
('level_2_commission', '2000'),
('level_3_commission', '2000'),
('level_4_commission', '1500'),
('level_5_commission', '1500'),
('level_6_commission', '1500'),
('max_matrix_levels', '6'),
('referrals_per_level', '5'),
('company_name', 'Bright Orion'),
('company_email', 'info@brightorian.com'),
('company_phone', '+234-800-BRIGHT'),
('withdrawal_fee', '500'),
('referral_bonus', '1000');

-- Generate some sample activation PINs
INSERT OR IGNORE INTO activation_pins (pin_code, status, created_by) VALUES
('PIN001234', 'available', 1),
('PIN001235', 'available', 1),
('PIN001236', 'available', 1),
('PIN001237', 'available', 1),
('PIN001238', 'available', 1),
('PIN001239', 'available', 1),
('PIN001240', 'available', 1),
('PIN001241', 'available', 1),
('PIN001242', 'available', 1),
('PIN001243', 'available', 1);

-- Create sample test user
INSERT OR IGNORE INTO users (
    member_id, first_name, last_name, email, phone, password_hash, 
    sponsor_id, upline_id, status, role, activation_date, created_at
) VALUES (
    'BO000002', 
    'Test', 
    'User', 
    'test@brightorian.com', 
    '+2348000000001', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    1,
    1,
    'active', 
    'user', 
    strftime('%s', 'now'),
    strftime('%s', 'now')
);

-- Add matrix position for test user
INSERT OR IGNORE INTO matrix_positions (user_id, level, position, parent_id) VALUES
(2, 1, 1, 1);

-- Add sample commission for test user
INSERT OR IGNORE INTO commissions (
    user_id, from_user_id, amount, level, commission_type, status
) VALUES (
    1, 2, 4000.00, 1, 'referral', 'approved'
);

SELECT 'Sample data inserted successfully!' as message;
SELECT 'Admin Login: admin@brightorian.com / admin123' as admin_credentials;
SELECT 'Test User Login: test@brightorian.com / admin123' as test_credentials;
SELECT 'Available PINs: PIN001234, PIN001235, PIN001236...' as sample_pins;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    sponsor_id INTEGER REFERENCES users(id),
    upline_id INTEGER REFERENCES users(id),
    location TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    role TEXT NOT NULL DEFAULT 'user',
    activation_date INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create activation_pins table
CREATE TABLE IF NOT EXISTS activation_pins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pin_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    created_by INTEGER REFERENCES users(id),
    used_by INTEGER REFERENCES users(id),
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    used_at INTEGER
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    tracking_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    confirmed_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create matrix_positions table
CREATE TABLE IF NOT EXISTS matrix_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    level INTEGER NOT NULL,
    position INTEGER NOT NULL,
    parent_id INTEGER REFERENCES users(id),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    level INTEGER NOT NULL,
    commission_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_by INTEGER REFERENCES users(id),
    processed_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
CREATE INDEX IF NOT EXISTS idx_activation_pins_code ON activation_pins(pin_code);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_positions_user_id ON matrix_positions(user_id);

SELECT 'Database schema created successfully!' as message;

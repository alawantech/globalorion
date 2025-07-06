-- Initialize database tables and default data
-- This script sets up the basic structure for the MLM system

-- Create users table structure (for reference)
-- Note: This is handled by the JSON database in lib/db.ts

-- Default admin user will be created automatically
-- Email: admin@brightorian.com (or from ADMIN_EMAIL env var)
-- Password: admin123 (or from ADMIN_PASSWORD env var)
-- Member ID: BO000001

-- Sample PINs will be generated automatically:
-- PIN123456, PIN123457, PIN123458, PIN123459, PIN123460

-- Database initialization complete
SELECT 'Database initialization script executed' as status;

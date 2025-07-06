# Global Orion MLM Platform

🚀 **Nigeria's Premier Multi-Level Marketing Platform**

A comprehensive MLM platform built with Next.js, featuring secure user registration, payment processing with Paystack, 6-level matrix commission system, and advanced admin management.

## 🌟 Features

- 🔐 **Secure Authentication & Registration**
- 💳 **Paystack Payment Integration**
- 📊 **6-Level Matrix Commission System**
- 👥 **Advanced Admin Dashboard**
- 📱 **Mobile-First Responsive Design**
- 🔑 **PIN-based Account Activation**
- 📧 **Automated Email Notifications**
- 💰 **Withdrawal Management System**
- 📈 **Real-time Analytics & Reports**
- 🛡️ **Enterprise-Grade Security**

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui Components
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: JWT + bcrypt Encryption
- **Payment**: Paystack Integration
- **Email**: Nodemailer with SMTP
- **Deployment**: Vercel Platform
- **Security**: Rate Limiting, Input Validation, CSRF Protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Neon PostgreSQL account
- Paystack merchant account
- Gmail account for SMTP

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/zahraddeensaleh/globalorion-mlm.git
cd globalorion-mlm
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your environment variables in `.env`:

\`\`\`env
# Database (Get from Neon Dashboard)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Admin Credentials (Change these!)
ADMIN_EMAIL="zahraddeensaleh@gmail.com"
ADMIN_PASSWORD="SecureAdmin123!"
ADMIN_PHONE="+2348101227065"

# JWT Secret (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET="your-super-secure-jwt-secret-key"

# Paystack Keys (Get from Paystack Dashboard)
PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="zahraddeensaleh@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="zahraddeensaleh@gmail.com"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
\`\`\`

### 4. Database Setup

1. **Create Neon Account**: Visit [neon.tech](https://neon.tech)
2. **Create Project**: New project → Copy connection string
3. **Run SQL Script**: Execute the following in Neon SQL Editor:

\`\`\`sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
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
    activation_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activation_pins table
CREATE TABLE IF NOT EXISTS activation_pins (
    id SERIAL PRIMARY KEY,
    pin_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    created_by INTEGER REFERENCES users(id),
    used_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    tracking_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create matrix_positions table
CREATE TABLE IF NOT EXISTS matrix_positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    level INTEGER NOT NULL,
    position INTEGER NOT NULL,
    parent_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    from_user_id INTEGER REFERENCES users(id) NOT NULL,
    amount REAL NOT NULL,
    level INTEGER NOT NULL,
    commission_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    amount REAL NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stockists table
CREATE TABLE IF NOT EXISTS stockists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    business_name TEXT NOT NULL,
    business_address TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    business_email TEXT NOT NULL,
    cac_number TEXT,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stockist_transactions table
CREATE TABLE IF NOT EXISTS stockist_transactions (
    id SERIAL PRIMARY KEY,
    stockist_id INTEGER REFERENCES stockists(id) NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    quantity INTEGER,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create login_attempts table for security
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### 5. Initialize Database

\`\`\`bash
npm run dev
\`\`\`

Visit: `http://localhost:3000/api/init`

### 6. Test the Application

1. **Admin Login**: 
   - URL: `/auth/login`
   - Email: `zahraddeensaleh@gmail.com`
   - Password: `SecureAdmin123!`

2. **User Registration**:
   - URL: `/auth/register`
   - Use Sponsor ID: `GO000001`

3. **Admin Dashboard**: `/admin`

## 🔒 Security Features

### Authentication & Authorization
- **Password Encryption**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth with jose library
- **Role-based Access Control**: Admin, User, Stockist roles
- **Session Management**: HTTP-only cookies with secure flags
- **Token Expiration**: 7-day token lifecycle

### Input Validation & Sanitization
- **Schema Validation**: Zod-based input validation
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookie attributes

### Rate Limiting & Monitoring
- **API Rate Limiting**: Endpoint-specific rate limits
- **Login Attempt Tracking**: Failed login monitoring
- **Audit Logging**: Complete action tracking
- **IP-based Restrictions**: Suspicious activity detection

### Data Protection
- **Database Encryption**: SSL/TLS connections
- **Environment Variables**: Secure secret management
- **HTTPS Enforcement**: Production SSL requirements
- **Data Sanitization**: Input/output data cleaning

### Security Headers
\`\`\`javascript
// Security headers configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
\`\`\`

## 📊 Commission Structure

| Level | Commission | Description |
|-------|------------|-------------|
| Level 1 | ₦4,000 | Direct referrals |
| Level 2 | ₦2,000 | Second level |
| Level 3 | ₦2,000 | Third level |
| Level 4 | ₦1,500 | Fourth level |
| Level 5 | ₦1,500 | Fifth level |
| Level 6 | ₦1,500 | Sixth level |

**Total Potential**: ₦12,500 per complete matrix

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
\`\`\`bash
git add .
git commit -m "Initial deployment"
git push origin main
\`\`\`

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Environment Variables in Vercel**:
   - Copy all variables from `.env`
   - Update `NEXT_PUBLIC_APP_URL` to your domain

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `POST /api/admin/generate-pins` - Generate PINs
- `POST /api/admin/approve-commission` - Approve commissions

### Payment
- `POST /api/payment/process` - Process payments
- `POST /api/payment/paystack/initialize` - Initialize payment

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

## 🛡️ Security Best Practices

### For Administrators
1. **Strong Passwords**: Use complex passwords with special characters
2. **Two-Factor Authentication**: Enable 2FA when available
3. **Regular Updates**: Keep dependencies updated
4. **Access Monitoring**: Review admin access logs regularly
5. **Backup Strategy**: Regular database backups

### For Developers
1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Generate cryptographically secure secrets
3. **Database Security**: Use connection pooling and SSL
4. **Code Reviews**: Implement peer review process
5. **Security Testing**: Regular penetration testing

### For Users
1. **Password Security**: Use unique, strong passwords
2. **Account Monitoring**: Check account activity regularly
3. **Secure Connections**: Always use HTTPS
4. **Phishing Awareness**: Verify official communications
5. **Device Security**: Keep devices updated and secure

## 📞 Support & Contact

### Developer Information
- **Name**: Zahraddeen Saleh
- **Email**: zahraddeensaleh@gmail.com
- **Phone**: +2348101227065
- **GitHub**: [github.com/zahraddeensaleh](https://github.com/zahraddeensaleh)

### Support Channels
- **Technical Support**: zahraddeensaleh@gmail.com
- **Business Inquiries**: +2348101227065
- **Bug Reports**: [GitHub Issues](https://github.com/zahraddeensaleh/globalorion-mlm/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/zahraddeensaleh/globalorion-mlm/discussions)

### Response Times
- **Critical Issues**: Within 2 hours
- **General Support**: Within 24 hours
- **Feature Requests**: Within 1 week
- **Bug Reports**: Within 48 hours

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow security guidelines
- Use conventional commit messages

## 🔐 Security Policy

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please send an email to zahraddeensaleh@gmail.com. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### Security Response Process
1. **Acknowledgment**: Within 24 hours
2. **Assessment**: Within 48 hours
3. **Fix Development**: Within 1 week
4. **Testing**: Within 2 days
5. **Deployment**: Within 24 hours of testing

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI Components by [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)
- Payment by [Paystack](https://paystack.com/)
- Hosted on [Vercel](https://vercel.com/)

## 📈 Version History

### v1.0.0 (Current)
- Initial release
- Complete MLM system
- Admin dashboard
- Payment integration
- Security implementation

### Roadmap
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API rate limiting dashboard
- [ ] Advanced reporting system

---

**Made with ❤️ by Zahraddeen Saleh in Nigeria 🇳🇬**

**© 2024 Global Orion MLM Platform. All rights reserved.**

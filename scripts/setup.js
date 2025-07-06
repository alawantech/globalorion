// Database setup and initialization script
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  try {
    console.log("Setting up MLM Admin System database...")

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log("Created data directory")
    }

    // Initialize database file if it doesn't exist
    const dbFile = path.join(dataDir, "database.json")
    if (!fs.existsSync(dbFile)) {
      const initialDb = {
        users: [],
        pins: [],
        stockists: [],
        stockTransactions: [],
        commissions: [],
        payments: [],
        nextUserId: 1,
        nextPinId: 1,
        nextStockistId: 1,
        nextTransactionId: 1,
        nextCommissionId: 1,
        nextPaymentId: 1,
      }

      fs.writeFileSync(dbFile, JSON.stringify(initialDb, null, 2))
      console.log("Created initial database file")
    }

    console.log("Database setup completed successfully!")
    console.log("")
    console.log("Next steps:")
    console.log("1. Set your environment variables")
    console.log("2. Run the application")
    console.log("3. Visit /api/init to initialize with default admin user")
    console.log("")
    console.log("Default admin credentials:")
    console.log("Email: admin@brightorian.com (or your ADMIN_EMAIL)")
    console.log("Password: admin123 (or your ADMIN_PASSWORD)")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

setupDatabase()

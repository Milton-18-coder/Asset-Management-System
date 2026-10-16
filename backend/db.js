import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'milton123';
const DB_NAME = process.env.DB_NAME || 'asset_management_db';

let pool = null;

export async function initDatabase() {
  try {
    // 1. Initial connection without specifying database (to ensure DB exists)
    const initialConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await initialConnection.end();

    // 2. Create pool connected to the database
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // 3. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mainCategory VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        itemType VARCHAR(100),
        building VARCHAR(100),
        department VARCHAR(100),
        room VARCHAR(100),
        assignedTo VARCHAR(150),
        assignedRole VARCHAR(150),
        assignedEmail VARCHAR(150),
        \`condition\` ENUM('Good', 'Fair', 'Poor', 'Damaged') DEFAULT 'Good',
        status ENUM('Available', 'In Use', 'Needs Inspection', 'Under Maintenance') DEFAULT 'Available',
        purchaseDate DATE,
        cost DECIMAL(12, 2) DEFAULT 0.00,
        supplier VARCHAR(255),
        warranty VARCHAR(100),
        quantity INT DEFAULT 1,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id VARCHAR(50) PRIMARY KEY,
        assetId VARCHAR(50),
        furniture VARCHAR(255),
        source VARCHAR(100),
        destination VARCHAR(100),
        requestedBy VARCHAR(150),
        role VARCHAR(100),
        department VARCHAR(100),
        date DATE,
        status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inspections (
        id VARCHAR(50) PRIMARY KEY,
        assetId VARCHAR(50),
        furniture VARCHAR(255),
        location VARCHAR(100),
        \`condition\` ENUM('Good', 'Fair', 'Poor', 'Damaged') NOT NULL,
        inspector VARCHAR(150),
        date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(150) NOT NULL,
        role ENUM('superadmin', 'deptadmin', 'auditor', 'faculty') NOT NULL,
        department VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(30) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        time VARCHAR(100),
        \`read\` BOOLEAN DEFAULT FALSE,
        department VARCHAR(100),
        recipient_user_id VARCHAR(50) NULL,
        recipient_role VARCHAR(50) NULL,
        notification_channel VARCHAR(50) NULL,
        asset_id VARCHAR(50) NULL,
        direction VARCHAR(50) NULL,
        status VARCHAR(50) NULL,
        type VARCHAR(50),
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safe schema migration for users table
    try {
      const [uCols] = await pool.query(`SHOW COLUMNS FROM users LIKE 'phone'`);
      if (uCols.length === 0) {
        await pool.query(`ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL AFTER email`);
      }
    } catch (e) {
      console.warn('Migration users.phone note:', e.message);
    }

    // Safe schema migrations for notifications table
    try {
      const [nCols] = await pool.query(`SHOW COLUMNS FROM notifications LIKE 'recipient_user_id'`);
      if (nCols.length === 0) {
        await pool.query(`ALTER TABLE notifications ADD COLUMN recipient_user_id VARCHAR(50) NULL AFTER department`);
      }
    } catch (e) {
      console.warn('Migration notifications.recipient_user_id note:', e.message);
    }

    try {
      const [nCols] = await pool.query(`SHOW COLUMNS FROM notifications LIKE 'recipient_role'`);
      if (nCols.length === 0) {
        await pool.query(`ALTER TABLE notifications ADD COLUMN recipient_role VARCHAR(50) NULL AFTER recipient_user_id`);
      }
    } catch (e) {
      console.warn('Migration notifications.recipient_role note:', e.message);
    }

    try {
      const [nCols] = await pool.query(`SHOW COLUMNS FROM notifications LIKE 'notification_channel'`);
      if (nCols.length === 0) {
        await pool.query(`ALTER TABLE notifications ADD COLUMN notification_channel VARCHAR(50) NULL AFTER recipient_role`);
      }
    } catch (e) {
      console.warn('Migration notifications.notification_channel note:', e.message);
    }

    try {
      const [nCols] = await pool.query(`SHOW COLUMNS FROM notifications LIKE 'asset_id'`);
      if (nCols.length === 0) {
        await pool.query(`ALTER TABLE notifications ADD COLUMN asset_id VARCHAR(50) NULL AFTER notification_channel`);
      }
    } catch (e) {
      console.warn('Migration notifications.asset_id note:', e.message);
    }

    try {
      const [nCols] = await pool.query(`SHOW COLUMNS FROM notifications LIKE 'direction'`);
      if (nCols.length === 0) {
        await pool.query(`ALTER TABLE notifications ADD COLUMN direction VARCHAR(50) NULL AFTER asset_id`);
      }
    } catch (e) {
      console.warn('Migration notifications.direction note:', e.message);
    }

    try {
      const [nCols] = await pool.query(`SHOW COLUMNS FROM notifications LIKE 'status'`);
      if (nCols.length === 0) {
        await pool.query(`ALTER TABLE notifications ADD COLUMN status VARCHAR(50) NULL AFTER direction`);
      }
    } catch (e) {
      console.warn('Migration notifications.status note:', e.message);
    }

    // Option 1: Infrastructure & Organizational Structure
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        building VARCHAR(100),
        hod VARCHAR(150),
        admin VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS buildings (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        floors INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(50) PRIMARY KEY,
        number VARCHAR(50) NOT NULL,
        building VARCHAR(100),
        department VARCHAR(100),
        floor INT DEFAULT 1,
        type VARCHAR(100) DEFAULT 'Classroom',
        capacity INT DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Option 2: Asset Lifecycle & Maintenance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id VARCHAR(50) PRIMARY KEY,
        assetId VARCHAR(50),
        furniture VARCHAR(255),
        issueDescription TEXT NOT NULL,
        scheduledDate DATE,
        completedDate DATE,
        cost DECIMAL(12, 2) DEFAULT 0.00,
        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        vendor VARCHAR(150),
        technicianNotes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS disposals (
        id VARCHAR(50) PRIMARY KEY,
        assetId VARCHAR(50) NOT NULL,
        furniture VARCHAR(255),
        disposalDate DATE NOT NULL,
        reason ENUM('Scrapped', 'Sold', 'Donated', 'Lost/Stolen', 'Damaged Beyond Repair') NOT NULL,
        resaleValue DECIMAL(12, 2) DEFAULT 0.00,
        approvedBy VARCHAR(150),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        contactPerson VARCHAR(150),
        email VARCHAR(150),
        phone VARCHAR(50),
        address TEXT,
        gstin VARCHAR(50),
        rating DECIMAL(3, 1) DEFAULT 4.5,
        services VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Option 3: Security, Audit & Classification
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50),
        userName VARCHAR(150),
        userRole VARCHAR(50),
        action VARCHAR(50) NOT NULL,
        entity VARCHAR(50) NOT NULL,
        entityId VARCHAR(50),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        mainCategory VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(50) DEFAULT 'Box',
        depreciationRate DECIMAL(5, 2) DEFAULT 10.00,
        usefulLifeYears INT DEFAULT 5,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Vendor–Asset Purchase History and Price Tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_history (
        id VARCHAR(50) PRIMARY KEY,
        assetId VARCHAR(50) NOT NULL,
        assetName VARCHAR(255) NOT NULL,
        vendorId VARCHAR(50),
        vendorName VARCHAR(200) NOT NULL,
        categoryId VARCHAR(100),
        categoryName VARCHAR(100) NOT NULL,
        subcategoryId VARCHAR(100),
        subcategoryName VARCHAR(100) NOT NULL,
        itemType VARCHAR(100),
        purchaseDate DATE NOT NULL,
        purchasePrice DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        quantity INT NOT NULL DEFAULT 1,
        totalAmount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
        invoiceNumber VARCHAR(100),
        invoiceDate DATE,
        warrantyExpiry VARCHAR(100),
        notes TEXT,
        batch_id VARCHAR(100),
        import_source ENUM('manual', 'csv', 'api', 'ai') DEFAULT 'manual',
        created_by VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ph_vendor (vendorId),
        INDEX idx_ph_asset (assetId),
        INDEX idx_ph_date (purchaseDate),
        INDEX idx_ph_category (categoryName),
        INDEX idx_ph_subcategory (subcategoryName),
        INDEX idx_ph_vendor_date (vendorId, purchaseDate),
        INDEX idx_ph_cat_sub_date (categoryName, subcategoryName, purchaseDate)
      );
    `);

    // Safe schema migration for existing purchase_history tables
    try {
      const [colRows] = await pool.query(`SHOW COLUMNS FROM purchase_history LIKE 'batch_id'`);
      if (colRows.length === 0) {
        await pool.query(`ALTER TABLE purchase_history ADD COLUMN batch_id VARCHAR(100) AFTER notes`);
      }
    } catch (e) {
      console.warn('Migration batch_id note:', e.message);
    }

    try {
      const [colRows] = await pool.query(`SHOW COLUMNS FROM purchase_history LIKE 'import_source'`);
      if (colRows.length === 0) {
        await pool.query(`ALTER TABLE purchase_history ADD COLUMN import_source ENUM('manual', 'csv', 'api', 'ai') DEFAULT 'manual' AFTER batch_id`);
      }
    } catch (e) {
      console.warn('Migration import_source note:', e.message);
    }

    try {
      const [colRows] = await pool.query(`SHOW COLUMNS FROM purchase_history LIKE 'created_by'`);
      if (colRows.length === 0) {
        await pool.query(`ALTER TABLE purchase_history ADD COLUMN created_by VARCHAR(150) AFTER import_source`);
      }
    } catch (e) {
      console.warn('Migration created_by note:', e.message);
    }

    // AI Chatbot Audit & Query Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_audit_logs (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50),
        userName VARCHAR(150),
        userRole VARCHAR(50),
        mode ENUM('agent', 'rule') NOT NULL,
        intent VARCHAR(100),
        tool VARCHAR(100),
        status VARCHAR(50) DEFAULT 'success',
        responseTimeMs INT DEFAULT 0,
        prompt TEXT,
        responseSummary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('MySQL Database, 15 Tables, and migrations initialized successfully');
    return pool;
  } catch (error) {
    console.error('Failed to initialize MySQL Database:', error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

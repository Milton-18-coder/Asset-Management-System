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
        type VARCHAR(50),
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    console.log('✅ MySQL Database and 13 Tables initialized successfully');
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize MySQL Database:', error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

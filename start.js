

/**
 * Quick Start Script for Motorbike & Scooter Rental Backend
 * This script helps set up and start the development server
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Motorbike & Scooter Rental Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('  .env file not found. Please create one with your database credentials.');
  console.log('   Copy from .env.example or create with:');
  console.log('   - DB_HOST=localhost');
  console.log('   - DB_PORT=5432');
  console.log('   - DB_NAME=motorbike_rental_db');
  console.log('   - DB_USER=your_db_user');
  console.log('   - DB_PASSWORD=your_db_password');
  console.log('   - JWT_SECRET=your_jwt_secret_key_here\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log(' Installing dependencies...');
  const installProcess = spawn('npm', ['install'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log(' Dependencies installed successfully!\n');
      startServer();
    } else {
      console.error(' Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log(' Starting development server...');
  console.log(' API will be available at: http://localhost:3000');
  console.log(' API Documentation at: http://localhost:3000/api\n');

  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(' Server failed to start');
      process.exit(1);
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n Shutting down server...');
  process.exit(0);
});

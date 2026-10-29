#!/usr/bin/env node
// Setup script for the salary management backend
import fs from 'fs';
import path from 'path';

console.log('Setting up server...');

// Ensure necessary directories exist
const directories = ['db', 'logs'];
directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

console.log('Setup complete!');
console.log('Next steps:');
console.log('1. Run "npm run db:push" to apply the Prisma schema');
console.log('2. Run "npm run db:seed" to seed initial data');
console.log('3. Start the server with "npm run dev"');

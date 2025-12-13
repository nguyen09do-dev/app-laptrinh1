#!/usr/bin/env node

/**
 * Direct Backend Starter
 * Starts the backend server without needing PowerShell execution policy changes
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting AI Content Studio Backend...\n');

const backendPath = __dirname;
const indexPath = path.join(backendPath, 'src', 'index.ts');

// Start backend with tsx
const backend = spawn('npx', ['tsx', 'watch', indexPath], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    FORCE_COLOR: '1'
  }
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error.message);
  process.exit(1);
});

backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Backend exited with code ${code}`);
    process.exit(code);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Stopping backend...');
  backend.kill('SIGINT');
  setTimeout(() => process.exit(0), 1000);
});

console.log('✅ Backend starting...');
console.log('📊 Logs will appear below:\n');
console.log('─'.repeat(60));


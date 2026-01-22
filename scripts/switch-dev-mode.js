#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'en';
const workspaceFolder = path.join(__dirname, '..');

console.log(`🔄 Switching to ${mode} development mode...`);

const packageJsonPath = path.join(workspaceFolder, 'package.json');
const packageJsonBackupPath = path.join(workspaceFolder, 'package.json.backup');

const sourceFile = mode === 'zh' 
  ? path.join(workspaceFolder, 'package.dev.zh.json')
  : path.join(workspaceFolder, 'package.dev.json');

if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Source file not found: ${sourceFile}`);
  console.log('Please run prepare-dev.js or prepare-dev-zh.js first');
  process.exit(1);
}

if (fs.existsSync(packageJsonBackupPath)) {
  console.log('⚠️  Backup already exists, restoring...');
  const backupContent = fs.readFileSync(packageJsonBackupPath, 'utf8');
  fs.writeFileSync(packageJsonPath, backupContent, 'utf8');
  console.log('✅ Restored original package.json');
}

const originalContent = fs.readFileSync(packageJsonPath, 'utf8');
fs.writeFileSync(packageJsonBackupPath, originalContent, 'utf8');

const devContent = fs.readFileSync(sourceFile, 'utf8');
fs.writeFileSync(packageJsonPath, devContent, 'utf8');

console.log(`✅ Switched to ${mode} development mode`);
console.log(`📝 Backup saved to package.json.backup`);
console.log('💡 To restore original, run: node scripts/switch-dev-mode.js restore');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function prepareChineseDevelopment() {
  const workspaceFolder = path.join(__dirname, '..');
  
  console.log('🚀 Preparing Chinese development environment...');
  
  const packageJsonPath = path.join(workspaceFolder, 'package.json');
  const nlsPath = path.join(workspaceFolder, 'package.nls.zh-cn.json');
  const devPackagePath = path.join(workspaceFolder, 'package.dev.zh.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const nlsData = JSON.parse(fs.readFileSync(nlsPath, 'utf8'));
  
  const packageJsonString = JSON.stringify(packageJson, null, 2);
  
  let replacedString = packageJsonString;
  
  Object.keys(nlsData).forEach(key => {
    const placeholder = `%${key}%`;
    const value = nlsData[key];
    replacedString = replacedString.replace(new RegExp(placeholder.replace(/%/g, '\\%'), 'g'), value);
  });
  
  const devJson = JSON.parse(replacedString);
  
  fs.writeFileSync(devPackagePath, JSON.stringify(devJson, null, 2), 'utf8');
  
  console.log('✅ Created package.dev.zh.json for Chinese development');
  console.log('📝 Use this file for debugging Chinese version in VSCode');
}

prepareChineseDevelopment();
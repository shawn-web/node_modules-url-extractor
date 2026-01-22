#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function replacePlaceholders() {
  const workspaceFolder = process.argv[2] || __dirname;
  const locale = process.argv[3] || 'en';
  
  const packageJsonPath = path.join(workspaceFolder, 'package.json');
  const nlsPath = locale === 'zh-cn' || locale === 'zh-CN' 
    ? path.join(workspaceFolder, 'package.nls.zh-cn.json')
    : path.join(workspaceFolder, 'package.nls.json');
  
  console.log(`🔄 Replacing placeholders for locale: ${locale}`);
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ package.json not found at ${packageJsonPath}`);
    return;
  }
  
  if (!fs.existsSync(nlsPath)) {
    console.error(`❌ NLS file not found at ${nlsPath}`);
    return;
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
  
  const replacedJson = JSON.parse(replacedString);
  
  const outputPath = path.join(workspaceFolder, 'package.dev.json');
  fs.writeFileSync(outputPath, JSON.stringify(replacedJson, null, 2), 'utf8');
  
  console.log(`✅ Created development package.json at ${outputPath}`);
  console.log(`📝 Locale: ${locale}`);
  console.log(`🔤 Replaced ${Object.keys(nlsData).length} placeholders`);
}

replacePlaceholders();
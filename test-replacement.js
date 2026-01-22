#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 测试占位符替换
function testReplacement() {
    console.log('🧪 Testing placeholder replacement...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nlsData = JSON.parse(fs.readFileSync('package.nls.zh-cn.json', 'utf8'));
    
    const packageJsonString = JSON.stringify(packageJson, null, 2);
    
    console.log('📝 Original viewsWelcome:', packageJson.contributes.viewsWelcome[0].contents);
    console.log('🌐 Translation:', nlsData.welcomeMessage);
    
    let replacedString = packageJsonString;
    let replacedCount = 0;
    
    Object.keys(nlsData).forEach(key => {
        const placeholder = `%${key}%`;
        const value = nlsData[key];
        const regex = new RegExp(placeholder.replace(/%/g, '\\%'), 'g');
        
        if (replacedString.includes(placeholder)) {
            replacedString = replacedString.replace(regex, value);
            replacedCount++;
            console.log(`✅ Replaced ${placeholder} -> ${value.substring(0, 30)}...`);
        }
    });
    
    console.log(`\n📊 Replaced ${replacedCount} placeholders`);
    
    const replacedJson = JSON.parse(replacedString);
    console.log('📝 New viewsWelcome:', replacedJson.contributes.viewsWelcome[0].contents);
}

testReplacement();
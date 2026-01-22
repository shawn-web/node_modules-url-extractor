#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// 创建 VSIX 包
async function createVSIX() {
    const zip = new JSZip();
    
    // 读取 out 目录中的文件
    const outPath = path.join(__dirname, 'out');
    const outFiles = fs.readdirSync(outPath);
    
    // 添加 out 目录中的所有文件到 extension/ 目录
    outFiles.forEach(file => {
        const filePath = path.join(outPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
            const content = fs.readFileSync(filePath);
            zip.file(`extension/${file}`, content);
        } else if (stat.isDirectory()) {
            // 递归添加目录
            addDirectoryToZip(zip, filePath, `extension/${file}`);
        }
    });
    
    // 读取并修改 package.json
    let packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    // 读取英文本地化文件来替换占位符
    const nlsPath = path.join(__dirname, 'package.nls.json');
    if (fs.existsSync(nlsPath)) {
        const nlsData = JSON.parse(fs.readFileSync(nlsPath, 'utf8'));
        const packageJsonString = JSON.stringify(packageJson, null, 2);
        
        // 替换所有占位符
        let replacedString = packageJsonString;
        Object.keys(nlsData).forEach(key => {
            const placeholder = `%${key}%`;
            const value = nlsData[key];
            replacedString = replacedString.replace(new RegExp(placeholder.replace(/%/g, '\\%'), 'g'), value);
        });
        
        packageJson = JSON.parse(replacedString);
        console.log('✅ Replaced localization placeholders');
    }
    
    // 修改 main 字段以适应 VSIX 包结构
    packageJson.main = './extension.js';
    
    // 写入修改后的 package.json
    const modifiedPackageJson = JSON.stringify(packageJson, null, 2);
    zip.file('extension/package.json', modifiedPackageJson);
    
    // 添加本地化文件（虽然占位符已被替换，但保留文件以兼容）
    const nlsFiles = ['package.nls.json', 'package.nls.zh-cn.json'];
    nlsFiles.forEach(nlsFile => {
        const nlsPath = path.join(__dirname, nlsFile);
        if (fs.existsSync(nlsPath)) {
            const nlsContent = fs.readFileSync(nlsPath);
            zip.file(`extension/${nlsFile}`, nlsContent);
            console.log(`✅ Added ${nlsFile}`);
        } else {
            console.log(`⚠️  ${nlsFile} not found`);
        }
    });
    
    // 添加资源文件
    const resourcesPath = path.join(__dirname, 'resources');
    if (fs.existsSync(resourcesPath)) {
        addDirectoryToZip(zip, resourcesPath, 'extension/resources');
        console.log('✅ Added resources directory');
    }
    
    // 读取 .vscodeignore 并过滤文件
    let ignorePatterns = [];
    try {
        const ignoreContent = fs.readFileSync(path.join(__dirname, '.vscodeignore'), 'utf8');
        ignorePatterns = ignoreContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    } catch (e) {
        console.log('No .vscodeignore found, including all files');
    }
    
    // 生成 VSIX 文件
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    const vsixName = `node_modules-url-extractor-0.1.0.vsix`;
    fs.writeFileSync(vsixName, content);
    
    console.log(`✅ VSIX package created: ${vsixName}`);
    console.log(`📦 Package size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
}

function addDirectoryToZip(zip, dirPath, zipPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
            const content = fs.readFileSync(filePath);
            zip.file(`${zipPath}/${file}`, content);
        } else if (stat.isDirectory()) {
            addDirectoryToZip(zip, filePath, `${zipPath}/${file}`);
        }
    });
}

createVSIX().catch(console.error);
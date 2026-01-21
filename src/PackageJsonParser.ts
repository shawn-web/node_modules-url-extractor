import * as fs from 'fs';
import * as path from 'path';
import { PackageInfo, ExtractorConfig } from './NodeModulesExtractor';

export class PackageJsonParser {
    private rootPackageJson: any = null;
    private dependencyTypes: Map<string, 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies'> = new Map();
    private externalNodeModulesPaths: string[] = [];

    constructor(private config: ExtractorConfig, nodeModulesPaths?: string[]) {
        if (nodeModulesPaths) {
            this.externalNodeModulesPaths = nodeModulesPaths;
        }
    }

    public async extractAllPackages(rootPath: string, progressCallback?: (current: number, total: number) => void): Promise<PackageInfo[]> {
        const packages: PackageInfo[] = [];
        
        // 读取根项目的package.json
        await this.loadRootPackageJson(rootPath);
        
        // 从根package.json开始递归解析依赖
        await this.processRootDependencies(rootPath, packages, progressCallback);
        return packages;
    }

    private async loadRootPackageJson(rootPath: string): Promise<void> {
        const packageJsonPath = path.join(rootPath, 'package.json');
        console.log(`尝试加载 package.json: ${packageJsonPath}`);
        
        if (fs.existsSync(packageJsonPath)) {
            try {
                console.log(`找到 package.json，正在读取...`);
                const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
                this.rootPackageJson = JSON.parse(packageJsonContent);
                console.log(`成功解析 package.json，依赖数量:`, {
                    dependencies: Object.keys(this.rootPackageJson.dependencies || {}).length,
                    devDependencies: Object.keys(this.rootPackageJson.devDependencies || {}).length,
                    peerDependencies: Object.keys(this.rootPackageJson.peerDependencies || {}).length,
                    optionalDependencies: Object.keys(this.rootPackageJson.optionalDependencies || {}).length
                });
                
                // 构建依赖类型映射
                const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;
                
                for (const depType of depTypes) {
                    if (this.rootPackageJson[depType]) {
                        for (const depName of Object.keys(this.rootPackageJson[depType])) {
                            this.dependencyTypes.set(depName, depType);
                        }
                    }
                }
            } catch (error) {
                console.warn(`读取根package.json失败: ${packageJsonPath}`, error);
                this.rootPackageJson = null;
            }
        } else {
            console.log(`未找到 package.json: ${packageJsonPath}`);
            // 尝试在子目录中查找 package.json
            await this.findPackageJsonInSubdirectories(rootPath);
        }
    }

    private async findPackageJsonInSubdirectories(rootPath: string): Promise<void> {
        console.log(`在子目录中查找 package.json: ${rootPath}`);
        try {
            const entries = fs.readdirSync(rootPath, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory() && !this.shouldIgnoreDirectory(entry.name)) {
                    const subDir = path.join(rootPath, entry.name);
                    const packageJsonPath = path.join(subDir, 'package.json');
                    
                    if (fs.existsSync(packageJsonPath)) {
                        console.log(`在子目录 ${entry.name} 中找到 package.json`);
                        try {
                            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
                            this.rootPackageJson = JSON.parse(packageJsonContent);
                            console.log(`成功解析子目录中的 package.json，依赖数量:`, {
                                dependencies: Object.keys(this.rootPackageJson.dependencies || {}).length,
                                devDependencies: Object.keys(this.rootPackageJson.devDependencies || {}).length,
                                peerDependencies: Object.keys(this.rootPackageJson.peerDependencies || {}).length,
                                optionalDependencies: Object.keys(this.rootPackageJson.optionalDependencies || {}).length
                            });
                            
                            // 构建依赖类型映射
                            const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;
                            
                            for (const depType of depTypes) {
                                if (this.rootPackageJson[depType]) {
                                    for (const depName of Object.keys(this.rootPackageJson[depType])) {
                                        this.dependencyTypes.set(depName, depType);
                                    }
                                }
                            }
                            return; // 找到第一个就返回
                        } catch (error) {
                            console.warn(`读取子目录 package.json 失败: ${packageJsonPath}`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`搜索子目录失败: ${rootPath}`, error);
        }
    }

    private shouldIgnoreDirectory(dirName: string): boolean {
        const ignoreDirs = [
            '.git', '.vscode', '.idea', 'node_modules', 'dist', 'build',
            'coverage', '.nyc_output', '.next', '.nuxt', '.vuepress',
            '__pycache__', '.pytest_cache', 'venv', 'env'
        ];
        return ignoreDirs.includes(dirName) || dirName.startsWith('.');
    }

    private async processRootDependencies(rootPath: string, packages: PackageInfo[], progressCallback?: (current: number, total: number) => void): Promise<void> {
        if (!this.rootPackageJson) {
            return;
        }

        // 收集所有直接依赖
        const allDeps = new Set<string>();
        const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;
        
        for (const depType of depTypes) {
            if (this.rootPackageJson[depType]) {
                for (const depName of Object.keys(this.rootPackageJson[depType])) {
                    allDeps.add(depName);
                }
            }
        }

        const totalDeps = allDeps.size;
        let processedCount = 0;

        // 处理所有依赖
        const processedPackages = new Set<string>();
        for (const depName of allDeps) {
            await this.processDependencyRecursively(rootPath, depName, packages, processedPackages, 0);
            processedCount++;
            
            // 调用进度回调
            if (progressCallback) {
                progressCallback(processedCount, totalDeps);
            }
        }
    }

    private async processDependencyRecursively(
        rootPath: string,
        packageName: string,
        packages: PackageInfo[],
        processedPackages: Set<string>,
        depth: number,
        progressCallback?: (current: number, total: number) => void,
        parentName?: string
    ): Promise<void> {
        // 防止循环依赖，depth从0开始
        if (processedPackages.has(packageName) || depth > this.config.maxDepth) {
            return;
        }

        processedPackages.add(packageName);

        // 查找包的实际路径
        const packagePath = this.findPackagePath(rootPath, packageName);
        if (!packagePath) {
            console.warn(`无法找到包: ${packageName}`);
            return;
        }

        // 解析包信息
        const packageInfo = await this.parsePackageInfo(packagePath, packageName, depth, parentName);
        if (packageInfo && this.hasValidUrls(packageInfo)) {
            console.log(`解析包信息: ${packageName}, 深度: ${depth}, 父包: ${parentName}`);
            
            // 更新或添加包信息
            const existingIndex = packages.findIndex(p => p.name === packageInfo.name);
            if (existingIndex !== -1) {
                packages[existingIndex] = packageInfo;
            } else {
                packages.push(packageInfo);
            }
            
            // 只有当深度小于maxDepth-1时才处理子依赖
            if (depth < this.config.maxDepth - 1) {
                console.log(`开始处理 ${packageName} 的子依赖`);
                await this.processSubDependencies(rootPath, packagePath, packages, processedPackages, depth + 1, progressCallback, packageInfo.name);
            }
        }
    }

    private hasValidUrls(packageInfo: PackageInfo): boolean {
        // 检查是否有任何URL信息（即使不是有效URL也保留，用于显示）
        const hasAnyUrl = Object.values(packageInfo.urls).some(url => url && url.trim() !== '');
        // 同时检查是否有有效的URL
        const hasValidUrl = Object.values(packageInfo.urls).some(url => url && this.isValidUrl(url));
        
        // 保留包如果有任何URL信息，或者有基本包信息
        return hasAnyUrl || hasValidUrl || packageInfo.description || packageInfo.author;
    }

    private findPackagePath(rootPath: string, packageName: string): string | null {
        // 处理作用域包
        const isScoped = packageName.startsWith('@');
        
        // 从主模块获取所有 node_modules 路径
        const nodeModulesPaths = this.getAllNodeModulesPaths(rootPath);
        
        console.log(`查找包 ${packageName}，使用 node_modules 路径:`, nodeModulesPaths);
        
        // 在所有 node_modules 路径中查找包
        for (const nodeModulesPath of nodeModulesPaths) {
            let packagePath: string;
            if (isScoped) {
                const [scope, name] = packageName.split('/');
                packagePath = path.join(nodeModulesPath, scope, name);
            } else {
                packagePath = path.join(nodeModulesPath, packageName);
            }
            
            console.log(`检查包路径: ${packagePath}`);
            
            if (fs.existsSync(packagePath) && fs.statSync(packagePath).isDirectory()) {
                const packageJsonPath = path.join(packagePath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    console.log(`找到包: ${packageName} 在 ${packagePath}`);
                    return packagePath;
                }
            }
            
            // 只有当maxDepth > 1时才递归查找嵌套依赖
            if (this.config.maxDepth > 1) {
                const nestedPath = this.searchNestedPackage(nodeModulesPath, packageName, 0, this.config.maxDepth - 1);
                if (nestedPath) {
                    console.log(`通过递归搜索找到包: ${packageName} 在 ${nestedPath}`);
                    return nestedPath;
                }
            }
        }
        
        console.warn(`未找到包: ${packageName}`);
        return null;
    }

    private getAllNodeModulesPaths(rootPath: string): string[] {
        const paths: string[] = [];
        
        // 优先使用外部传入的 node_modules 路径
        if (this.externalNodeModulesPaths && this.externalNodeModulesPaths.length > 0) {
            paths.push(...this.externalNodeModulesPaths);
            console.log(`使用外部传入的 node_modules 路径:`, paths);
            return paths;
        }
        
        // 后备方案：从主模块获取所有 node_modules 路径
        paths.push(path.join(rootPath, 'node_modules'));
        
        // 尝试递归查找更多 node_modules
        try {
            const additionalPaths = this.findNodeModulesRecursively(rootPath, 0, 3);
            paths.push(...additionalPaths.filter(p => !paths.includes(p)));
        } catch (error) {
            console.warn('递归查找 node_modules 失败:', error);
        }
        
        console.log(`在 ${rootPath} 中找到的 node_modules 路径:`, paths);
        return paths;
    }

    private findNodeModulesRecursively(dirPath: string, currentDepth: number, maxDepth: number): string[] {
        if (currentDepth > maxDepth) {
            return [];
        }

        const paths: string[] = [];
        
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    if (entry.name === 'node_modules' && !fullPath.endsWith(path.join(dirPath, 'node_modules'))) {
                        paths.push(fullPath);
                    }
                    // 递归查找子目录（排除一些常见的忽略目录）
                    else if (!this.shouldIgnoreDirectory(entry.name)) {
                        const subPaths = this.findNodeModulesRecursively(fullPath, currentDepth + 1, maxDepth);
                        paths.push(...subPaths);
                    }
                }
            }
        } catch (error) {
            // 忽略读取错误
        }
        
        return paths;
    }

    

    private searchNestedPackage(searchPath: string, packageName: string, currentDepth: number, maxDepth: number): string | null {
        if (currentDepth > maxDepth) {
            return null;
        }

        // 检查当前目录
        const isScoped = packageName.startsWith('@');
        let packagePath: string;
        
        if (isScoped) {
            const [scope, name] = packageName.split('/');
            packagePath = path.join(searchPath, scope, name);
        } else {
            packagePath = path.join(searchPath, packageName);
        }
        
        if (fs.existsSync(packagePath)) {
            return packagePath;
        }

        // 遍历子目录查找node_modules
        try {
            const entries = fs.readdirSync(searchPath, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name === 'node_modules') {
                    // 检查此node_modules目录下的包
                    const nodeModulesPath = path.join(searchPath, entry.name);
                    const subEntries = fs.readdirSync(nodeModulesPath, { withFileTypes: true });
                    
                    for (const subEntry of subEntries) {
                        if (subEntry.isDirectory()) {
                            // 检查是否是作用域包目录
                            if (subEntry.name.startsWith('@')) {
                                const scopePath = path.join(nodeModulesPath, subEntry.name);
                                const scopeEntries = fs.readdirSync(scopePath, { withFileTypes: true });
                                
                                for (const scopeEntry of scopeEntries) {
                                    if (scopeEntry.isDirectory()) {
                                        const scopedPackageName = `@${subEntry.name}/${scopeEntry.name}`;
                                        if (scopedPackageName === packageName && fs.existsSync(path.join(scopePath, scopeEntry.name, 'package.json'))) {
                                            return path.join(scopePath, scopeEntry.name);
                                        }
                                    }
                                }
                            } else {
                                // 普通包
                                if (subEntry.name === packageName && fs.existsSync(path.join(nodeModulesPath, subEntry.name, 'package.json'))) {
                                    return path.join(nodeModulesPath, subEntry.name);
                                }
                            }
                        }
                    }
                    
                    // 递归搜索更深的层级
                    const nestedPath = this.searchNestedPackage(nodeModulesPath, packageName, currentDepth + 1, maxDepth);
                    if (nestedPath) {
                        return nestedPath;
                    }
                }
                
                // 如果是包目录，继续在其中查找node_modules
                if (entry.isDirectory() && entry.name !== '@' && !entry.name.startsWith('@')) {
                    const nestedPath = this.searchNestedPackage(path.join(searchPath, entry.name), packageName, currentDepth + 1, maxDepth);
                    if (nestedPath) {
                        return nestedPath;
                    }
                }
            }
        } catch (error) {
            console.warn(`搜索嵌套包时出错: ${searchPath}`, error);
        }
        
        return null;
    }

    private async parsePackageInfo(packagePath: string, packageName: string, depth: number, parentName?: string): Promise<PackageInfo | null> {
        const packageJsonPath = path.join(packagePath, 'package.json');
        
        if (!fs.existsSync(packageJsonPath)) {
            return null;
        }

        try {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);
            
            const actualPackageName = packageJson.name || packageName;
            
            return {
                name: actualPackageName,
                version: packageJson.version || 'unknown',
                path: packagePath,
                depth: depth,
                parent: parentName,
                dependencyType: this.dependencyTypes.get(actualPackageName) || (depth === 0 ? 'dependencies' : undefined),
                urls: this.extractUrls(packageJson),
                // 收集更多包信息用于详情显示
                description: packageJson.description || '',
                author: packageJson.author || '',
                license: packageJson.license || '',
                keywords: packageJson.keywords || [],
                repository: packageJson.repository || '',
                homepage: packageJson.homepage || '',
                bugs: packageJson.bugs || ''
            };
        } catch (error) {
            console.warn(`解析package.json失败: ${packageJsonPath}`, error);
            return null;
        }
    }

    private async processSubDependencies(
        rootPath: string,
        packagePath: string,
        packages: PackageInfo[],
        processedPackages: Set<string>,
        depth: number,
        progressCallback?: (current: number, total: number) => void,
        parentName?: string
    ): Promise<void> {
        const packageJsonPath = path.join(packagePath, 'package.json');
        
        if (!fs.existsSync(packageJsonPath)) {
            return;
        }

        try {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);
            
            // 获取所有依赖
            const allDeps = {
                ...packageJson.dependencies || {},
                ...packageJson.peerDependencies || {},
                ...packageJson.optionalDependencies || {}
            };

            console.log(`处理 ${parentName} 的子依赖，依赖数量: ${Object.keys(allDeps).length}`);

            // 处理每个依赖
            for (const depName of Object.keys(allDeps)) {
                if (!processedPackages.has(depName)) {
                    // 重要：这里应该使用当前包的名称作为parentName，而不是传入的parentName
                    const currentPackageName = packageJson.name || parentName;
                    console.log(`处理子依赖: ${depName}, 父包: ${currentPackageName}`);
                    
                    await this.processDependencyRecursively(
                        rootPath,
                        depName,
                        packages,
                        processedPackages,
                        depth,
                        progressCallback,
                        currentPackageName  // 使用当前包名作为父包名
                    );
                }
            }
        } catch (error) {
            console.warn(`处理子依赖失败: ${packageJsonPath}`, error);
        }
    }

    private extractUrls(packageJson: any): PackageInfo['urls'] {
        const urls: PackageInfo['urls'] = {};
        
        // 处理配置中的字段
        for (const field of this.config.includeFields) {
            const url = this.extractUrlFromField(packageJson, field);
            if (url && this.isValidUrl(url)) {
                urls[field] = url;
            }
        }
        
        // 特别处理一些常见的URL字段（如果不在配置字段中）
        const specialFields = ['homepage', 'repository', 'bugs'];
        for (const field of specialFields) {
            if (!this.config.includeFields.includes(field)) {
                const url = this.extractUrlFromField(packageJson, field);
                if (url && this.isValidUrl(url)) {
                    urls[field] = url;
                }
            }
        }
        
        // 尝试从其他字段提取URL
        this.extractUrlsFromCustomFields(packageJson, urls);
        
        return urls;
    }

    private extractUrlFromField(packageJson: any, field: string): string | null {
        if (!packageJson[field]) {
            return null;
        }
        
        if (typeof packageJson[field] === 'string') {
            return this.cleanUrl(packageJson[field]);
        } else if (typeof packageJson[field] === 'object') {
            const obj = packageJson[field];
            if (obj.url) {
                return this.cleanUrl(obj.url);
            } else if (obj.type && obj.url) {
                return `${obj.type}+${obj.url}`;
            }
        }
        
        return null;
    }

    private cleanUrl(url: string): string {
        // 清理Git URL格式（如git://, git+https://等）
        if (url.startsWith('git+')) {
            return url.substring(4);
        }
        if (url.startsWith('git://')) {
            return url.replace('git://', 'https://');
        }
        if (url.endsWith('.git')) {
            return url.slice(0, -4);
        }
        
        // 移除常见的邮件格式bug URL
        if (url.startsWith('mailto:')) {
            return url; // 保留邮件链接，但在后续验证中会被过滤
        }
        
        return url;
    }

    private extractUrlsFromCustomFields(packageJson: any, urls: PackageInfo['urls']): void {
        // 检查常见的文档相关字段
        if (!urls.documentation) {
            const docFields = ['docs', 'documentation', 'readme', 'wiki'];
            for (const field of docFields) {
                const url = this.extractUrlFromField(packageJson, field);
                if (url && this.isValidUrl(url)) {
                    urls.documentation = url;
                    break;
                }
            }
        }
        
        // 检查其他可能包含URL的字段
        if (!urls.website) {
            const urlFields = ['url', 'website', 'site', 'project', 'homepage'];
            for (const field of urlFields) {
                const url = this.extractUrlFromField(packageJson, field);
                if (url && this.isValidUrl(url)) {
                    urls.website = url;
                    break;
                }
            }
        }
    }

    private isValidUrl(string: string): boolean {
        if (!string || typeof string !== 'string') {
            return false;
        }

        // 排除明显的无效URL
        if (string.startsWith('mailto:') || 
            string.startsWith('file://') ||
            string.startsWith('#') ||
            string.length < 4) {
            return false;
        }

        try {
            const url = new URL(string);
            
            // 只允许常见的协议
            const allowedProtocols = ['http:', 'https:', 'git:', 'git+ssh:', 'ssh:'];
            if (!allowedProtocols.includes(url.protocol)) {
                return false;
            }
            
            // 检查是否有有效的域名
            if (!url.hostname && url.protocol !== 'file:') {
                return false;
            }
            
            return true;
        } catch {
            // 如果不是标准URL，尝试添加https://前缀再次验证
            if (!string.startsWith('http://') && !string.startsWith('https://')) {
                try {
                    new URL(`https://${string}`);
                    return true;
                } catch {
                    return false;
                }
            }
            return false;
        }
    }
}
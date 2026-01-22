import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PackageInfo, ExtractorConfig } from './NodeModulesExtractor';
import { I18n } from './i18n/I18n';

export interface CachedPackageInfo extends PackageInfo {
    lastModified: number;
    fileHash?: string;
}

export interface DependencyCache {
    packages: { [packageName: string]: CachedPackageInfo };
    lastFullScan: number;
    workspacePath: string;
}

export class IncrementalExtractor {
    private cache: DependencyCache | null = null;
    private cacheFilePath: string;

    constructor(private config: ExtractorConfig, private workspacePath: string) {
        this.cacheFilePath = path.join(workspacePath, '.vscode', 'node-modules-cache.json');
        this.loadCache();
    }

    private loadCache(): void {
        try {
            if (fs.existsSync(this.cacheFilePath)) {
                const cacheData = JSON.parse(fs.readFileSync(this.cacheFilePath, 'utf-8'));
                // 验证缓存的完整性
                if (cacheData.workspacePath === this.workspacePath) {
                    this.cache = cacheData;
                    return;
                }
            }
        } catch (error) {
            console.warn('Cache loading failed:', error);
        }
        
        // 初始化新缓存
        this.cache = {
            packages: {},
            lastFullScan: 0,
            workspacePath: this.workspacePath
        };
    }

    private saveCache(): void {
        try {
            const cacheDir = path.dirname(this.cacheFilePath);
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache, null, 2), 'utf-8');
        } catch (error) {
            console.warn('Cache saving failed:', error);
        }
    }

    public async extractChangedPackages(changedFiles: vscode.Uri[]): Promise<PackageInfo[]> {
        const changedPackages: PackageInfo[] = [];
        const packagePaths = new Set<string>();

        // 从变更文件中提取包路径
        for (const file of changedFiles) {
            const packagePath = this.extractPackagePath(file.fsPath);
            if (packagePath) {
                packagePaths.add(packagePath);
            }
        }

        // 检查每个包是否需要重新提取
        for (const packagePath of packagePaths) {
            if (this.shouldExtractPackage(packagePath)) {
                const packageInfo = await this.extractSinglePackage(packagePath);
                if (packageInfo) {
                    changedPackages.push(packageInfo);
                    this.updateCache(packageInfo);
                }
            }
        }

        // 保存更新后的缓存
        this.saveCache();
        return changedPackages;
    }

    private extractPackagePath(filePath: string): string | null {
        // 从package.json文件路径提取包目录
        if (!filePath.endsWith('package.json')) {
            return null;
        }

        const parts = filePath.split(path.sep);
        const nodeModulesIndex = parts.lastIndexOf('node_modules');
        
        if (nodeModulesIndex === -1 || nodeModulesIndex === parts.length - 1) {
            return null;
        }

        // 处理作用域包 (@scope/package)
        if (parts[nodeModulesIndex + 1].startsWith('@')) {
            if (nodeModulesIndex + 2 < parts.length) {
                return path.join(...parts.slice(0, nodeModulesIndex + 3));
            }
        } else {
            return path.join(...parts.slice(0, nodeModulesIndex + 2));
        }

        return null;
    }

    private shouldExtractPackage(packagePath: string): boolean {
        if (!this.cache) {
            return true;
        }

        const packageJsonPath = path.join(packagePath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            // 包被删除，从缓存中移除
            this.removePackageFromCache(packagePath);
            return false;
        }

        const stats = fs.statSync(packageJsonPath);
        const lastModified = stats.mtime.getTime();
        
        // 从包路径获取包名
        const packageName = this.getPackageNameFromPath(packagePath);
        const cachedPackage = this.cache.packages[packageName];

        if (!cachedPackage) {
            return true; // 新包，需要提取
        }

        if (cachedPackage.lastModified !== lastModified) {
            return true; // 文件已修改，需要重新提取
        }

        return false; // 无需重新提取
    }

    private async extractSinglePackage(packagePath: string): Promise<PackageInfo | null> {
        const packageJsonPath = path.join(packagePath, 'package.json');
        
        if (!fs.existsSync(packageJsonPath)) {
            return null;
        }

        try {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);
            
            // 计算文件修改时间
            const stats = fs.statSync(packageJsonPath);
            const lastModified = stats.mtime.getTime();
            
            const packageInfo: PackageInfo = {
                name: packageJson.name || this.getPackageNameFromPath(packagePath),
                version: packageJson.version || 'unknown',
                path: packagePath,
                depth: this.calculateDepth(packagePath),
                parent: this.getParentPackage(packagePath),
                urls: this.extractUrls(packageJson)
            };

            // 更新缓存信息
            const cachedInfo: CachedPackageInfo = {
                ...packageInfo,
                lastModified
            };

            return packageInfo;
        } catch (error) {
            console.warn(`解析package.json失败: ${packageJsonPath}`, error);
            return null;
        }
    }

    private updateCache(packageInfo: PackageInfo): void {
        if (!this.cache) {
            return;
        }

        const packageJsonPath = path.join(packageInfo.path, 'package.json');
        const stats = fs.statSync(packageJsonPath);
        
        const cachedInfo: CachedPackageInfo = {
            ...packageInfo,
            lastModified: stats.mtime.getTime()
        };

        this.cache.packages[packageInfo.name] = cachedInfo;
    }

    private removePackageFromCache(packagePath: string): void {
        if (!this.cache) {
            return;
        }

        const packageName = this.getPackageNameFromPath(packagePath);
        if (this.cache.packages[packageName]) {
            delete this.cache.packages[packageName];
        }
    }

    private getPackageNameFromPath(packagePath: string): string {
        const parts = packagePath.split(path.sep);
        const nodeModulesIndex = parts.lastIndexOf('node_modules');
        
        if (nodeModulesIndex === -1) {
            return path.basename(packagePath);
        }

        // 处理作用域包
        if (parts[nodeModulesIndex + 1].startsWith('@')) {
            if (nodeModulesIndex + 2 < parts.length) {
                return `${parts[nodeModulesIndex + 1]}/${parts[nodeModulesIndex + 2]}`;
            }
        }

        return parts[nodeModulesIndex + 1] || path.basename(packagePath);
    }

    private calculateDepth(packagePath: string): number {
        const relativePath = path.relative(path.join(this.workspacePath, 'node_modules'), packagePath);
        const depth = relativePath.split(path.sep).filter(part => part && part !== 'node_modules').length;
        return Math.max(1, depth);
    }

    private getParentPackage(packagePath: string): string | undefined {
        const parts = packagePath.split(path.sep);
        const nodeModulesIndex = parts.lastIndexOf('node_modules');
        
        if (nodeModulesIndex <= 0) {
            return undefined; // 顶级包
        }

        // 查找父包
        let currentDepth = 0;
        for (let i = nodeModulesIndex + 1; i < parts.length; i++) {
            if (parts[i] === 'node_modules') {
                currentDepth++;
            }
        }

        if (currentDepth === 0) {
            return undefined;
        }

        // 简化的父包检测，可以根据需要改进
        const parentParts = parts.slice(0, -1);
        for (let i = parentParts.length - 1; i >= 0; i--) {
            const potentialParent = parentParts[i];
            if (potentialParent !== 'node_modules' && !potentialParent.startsWith('@')) {
                return potentialParent;
            }
        }

        return undefined;
    }

    private extractUrls(packageJson: any): PackageInfo['urls'] {
        const urls: PackageInfo['urls'] = {};
        
        for (const field of this.config.includeFields) {
            if (packageJson[field]) {
                if (typeof packageJson[field] === 'string') {
                    urls[field] = packageJson[field];
                } else if (typeof packageJson[field] === 'object' && packageJson[field].url) {
                    urls[field] = packageJson[field].url;
                }
            }
        }
        
        return urls;
    }

    public setFullScanResult(packages: PackageInfo[]): void {
        if (!this.cache) {
            return;
        }

        this.cache.packages = {};
        this.cache.lastFullScan = Date.now();

        for (const pkg of packages) {
            this.updateCache(pkg);
        }

        this.saveCache();
    }

    public getCachedPackages(): { [packageName: string]: CachedPackageInfo } {
        return this.cache?.packages || {};
    }

    public clearCache(): void {
        this.cache = {
            packages: {},
            lastFullScan: 0,
            workspacePath: this.workspacePath
        };
        
        try {
            if (fs.existsSync(this.cacheFilePath)) {
                fs.unlinkSync(this.cacheFilePath);
            }
        } catch (error) {
            console.warn('删除缓存文件失败:', error);
        }
    }
}
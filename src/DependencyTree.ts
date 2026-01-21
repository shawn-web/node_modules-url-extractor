import { PackageInfo } from './NodeModulesExtractor';

export interface DependencyTreeNode {
    name: string;
    version: string;
    path: string;
    depth: number;
    urls: PackageInfo['urls'];
    dependencyType?: PackageInfo['dependencyType'];
    dependencies?: { [key: string]: DependencyTreeNode };
}

export interface RootTreeNode {
    dependencies: { [key: string]: DependencyTreeNode };
    devDependencies: { [key: string]: DependencyTreeNode };
    peerDependencies?: { [key: string]: DependencyTreeNode };
    optionalDependencies?: { [key: string]: DependencyTreeNode };
    statistics?: any;
}

export class DependencyTree {
    private tree: RootTreeNode = {
        dependencies: {},
        devDependencies: {},
        peerDependencies: {},
        optionalDependencies: {}
    };

    public buildTree(packages: PackageInfo[]): void {
        // 清空现有树
        this.tree = {
            dependencies: {},
            devDependencies: {},
            peerDependencies: {},
            optionalDependencies: {}
        };

        console.log(`开始构建依赖树，包数量: ${packages.length}`);
        
        // 首先按深度排序包，确保父包先于子包被处理
        const sortedPackages = packages.sort((a, b) => a.depth - b.depth);
        
        // 打印调试信息
        sortedPackages.forEach(pkg => {
            console.log(`包: ${pkg.name}, 深度: ${pkg.depth}, 父包: ${pkg.parent}, 类型: ${pkg.dependencyType}`);
        });

        // 分两阶段构建树结构
        // 第一阶段：添加所有直接依赖（深度为0的包）
        for (const pkg of sortedPackages.filter(p => p.depth === 0)) {
            this.addPackageToTree(pkg);
        }
        
        // 第二阶段：添加子依赖（深度大于0的包）
        for (const pkg of sortedPackages.filter(p => p.depth > 0)) {
            this.addPackageToTree(pkg);
        }

        // 优化树结构，合并重复的依赖
        this.optimizeTree();
        
        console.log(`依赖树构建完成`);
    }

    private addPackageToTree(pkg: PackageInfo): void {
        const depType = pkg.dependencyType || 'dependencies';
        
        // 创建节点
        const node: DependencyTreeNode = {
            name: pkg.name,
            version: pkg.version,
            path: pkg.path,
            depth: pkg.depth,
            dependencyType: pkg.dependencyType,
            urls: pkg.urls,
            dependencies: {}
        };

        // 检查是否是根项目的直接依赖（depth为0表示直接依赖）
        const isDirectDependency = pkg.depth === 0;
        
        if (isDirectDependency) {
            // 直接依赖，添加到对应的依赖类型容器
            let targetContainer: { [key: string]: DependencyTreeNode };
            if (depType === 'dependencies') {
                targetContainer = this.tree.dependencies;
            } else if (depType === 'devDependencies') {
                targetContainer = this.tree.devDependencies;
            } else if (depType === 'peerDependencies') {
                if (!this.tree.peerDependencies) {
                    this.tree.peerDependencies = {};
                }
                targetContainer = this.tree.peerDependencies;
            } else if (depType === 'optionalDependencies') {
                if (!this.tree.optionalDependencies) {
                    this.tree.optionalDependencies = {};
                }
                targetContainer = this.tree.optionalDependencies;
            } else {
                targetContainer = this.tree.dependencies;
            }

            if (!targetContainer[pkg.name]) {
                targetContainer[pkg.name] = node;
            }
            console.log(`添加直接依赖: ${pkg.name} 到 ${depType}`);
        } else {
            // 间接依赖，查找父包并添加到其依赖中
            const parent = this.findPackageInTree(pkg.parent || '');
            if (parent) {
                if (!parent.dependencies![pkg.name]) {
                    parent.dependencies![pkg.name] = node;
                }
                console.log(`添加子依赖: ${pkg.name} 到父包: ${pkg.parent}`);
            } else {
                // 如果找不到父包，将其作为顶层依赖添加（这可能是父包还没有被处理）
                console.warn(`找不到父包 ${pkg.parent}，将 ${pkg.name} 作为临时顶层依赖，稍后会重新分配`);
                
                let targetContainer: { [key: string]: DependencyTreeNode };
                if (depType === 'dependencies') {
                    targetContainer = this.tree.dependencies;
                } else if (depType === 'devDependencies') {
                    targetContainer = this.tree.devDependencies;
                } else if (depType === 'peerDependencies') {
                    if (!this.tree.peerDependencies) {
                        this.tree.peerDependencies = {};
                    }
                    targetContainer = this.tree.peerDependencies;
                } else if (depType === 'optionalDependencies') {
                    if (!this.tree.optionalDependencies) {
                        this.tree.optionalDependencies = {};
                    }
                    targetContainer = this.tree.optionalDependencies;
                } else {
                    targetContainer = this.tree.dependencies;
                }

                if (!targetContainer[pkg.name]) {
                    targetContainer[pkg.name] = node;
                }
            }
        }
    }

    private findPackageInTree(packageName: string): DependencyTreeNode | null {
        // 在所有依赖类型容器中搜索
        const containers = [
            this.tree.dependencies,
            this.tree.devDependencies,
            this.tree.peerDependencies || {},
            this.tree.optionalDependencies || {}
        ];

        const searchInContainer = (container: { [key: string]: DependencyTreeNode }): DependencyTreeNode | null => {
            for (const dep of Object.values(container)) {
                if (dep.name === packageName) {
                    return dep;
                }
                // 递归搜索子依赖
                const found = this.findInDependencies(packageName, dep);
                if (found) {
                    return found;
                }
            }
            return null;
        };

        for (const container of containers) {
            const found = searchInContainer(container);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private findInDependencies(packageName: string, node: DependencyTreeNode): DependencyTreeNode | null {
        if (node.dependencies) {
            for (const dep of Object.values(node.dependencies)) {
                if (dep.name === packageName) {
                    return dep;
                }
                const found = this.findInDependencies(packageName, dep);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    private optimizeTree(): void {
        // 移除没有URL的叶子节点
        this.removeEmptyNodes();
        
        // 统计信息
        this.addStatistics();
    }

    private removeEmptyNodes(): void {
        // 在所有容器中移除空节点
        this.removeEmptyNodesInContainer(this.tree.dependencies);
        this.removeEmptyNodesInContainer(this.tree.devDependencies);
        if (this.tree.peerDependencies) {
            this.removeEmptyNodesInContainer(this.tree.peerDependencies);
        }
        if (this.tree.optionalDependencies) {
            this.removeEmptyNodesInContainer(this.tree.optionalDependencies);
        }
    }

    private removeEmptyNodesInContainer(container: { [key: string]: DependencyTreeNode }): void {
        const toRemove: string[] = [];
        
        for (const [name, dep] of Object.entries(container)) {
            const shouldKeep = this.removeEmptyNode(dep);
            if (!shouldKeep) {
                toRemove.push(name);
            }
        }

        // 移除空节点
        toRemove.forEach(name => delete container[name]);
    }

    private removeEmptyNode(node: DependencyTreeNode): boolean {
        if (!node.dependencies) {
            // 如果是叶子节点，保留所有包（即使没有URL），因为用户可能想看到包信息
            return true;
        }

        const toRemove: string[] = [];
        
        for (const [name, dep] of Object.entries(node.dependencies)) {
            const shouldKeep = this.removeEmptyNode(dep);
            if (!shouldKeep) {
                toRemove.push(name);
            }
        }

        // 移除空节点
        toRemove.forEach(name => delete node.dependencies![name]);

        // 保留所有节点，即使没有URL
        return true;
    }

    private hasUrls(urls: PackageInfo['urls']): boolean {
        // 更宽松的检查，只要有任何信息就保留
        return Object.values(urls).some(url => url && url.trim() !== '') || true;
    }

    private addStatistics(): void {
        // 为树添加统计信息
        this.tree.statistics = {
            totalPackages: this.countPackages(),
            packagesWithUrls: this.countPackagesWithUrls(),
            maxDepth: this.getMaxDepth(),
            totalUrls: this.countUrls()
        };
    }

    private countPackages(): number {
        let count = 0;
        const containers = [
            this.tree.dependencies,
            this.tree.devDependencies,
            this.tree.peerDependencies || {},
            this.tree.optionalDependencies || {}
        ];

        for (const container of containers) {
            for (const dep of Object.values(container)) {
                count += this.countPackagesInNode(dep);
            }
        }
        return count;
    }

    private countPackagesInNode(node: DependencyTreeNode): number {
        let count = 1; // 当前节点
        if (node.dependencies) {
            for (const dep of Object.values(node.dependencies)) {
                count += this.countPackagesInNode(dep);
            }
        }
        return count;
    }

    private countPackagesWithUrls(): number {
        let count = 0;
        const containers = [
            this.tree.dependencies,
            this.tree.devDependencies,
            this.tree.peerDependencies || {},
            this.tree.optionalDependencies || {}
        ];

        for (const container of containers) {
            for (const dep of Object.values(container)) {
                count += this.countPackagesWithUrlsInNode(dep);
            }
        }
        return count;
    }

    private countPackagesWithUrlsInNode(node: DependencyTreeNode): number {
        let count = this.hasUrls(node.urls) ? 1 : 0;
        if (node.dependencies) {
            for (const dep of Object.values(node.dependencies)) {
                count += this.countPackagesWithUrlsInNode(dep);
            }
        }
        return count;
    }

    private getMaxDepth(): number {
        let maxDepth = 0;
        const containers = [
            this.tree.dependencies,
            this.tree.devDependencies,
            this.tree.peerDependencies || {},
            this.tree.optionalDependencies || {}
        ];

        for (const container of containers) {
            for (const dep of Object.values(container)) {
                maxDepth = Math.max(maxDepth, this.getMaxDepthInNode(dep));
            }
        }
        return maxDepth;
    }

    private getMaxDepthInNode(node: DependencyTreeNode): number {
        let maxDepth = node.depth;
        if (node.dependencies) {
            for (const dep of Object.values(node.dependencies)) {
                const childDepth = this.getMaxDepthInNode(dep);
                maxDepth = Math.max(maxDepth, childDepth);
            }
        }
        return maxDepth;
    }

    private countUrls(): number {
        let count = 0;
        const containers = [
            this.tree.dependencies,
            this.tree.devDependencies,
            this.tree.peerDependencies || {},
            this.tree.optionalDependencies || {}
        ];

        for (const container of containers) {
            for (const dep of Object.values(container)) {
                count += this.countUrlsInNode(dep);
            }
        }
        return count;
    }

    private countUrlsInNode(node: DependencyTreeNode): number {
        let count = Object.values(node.urls).filter(url => url && url.trim() !== '').length;
        if (node.dependencies) {
            for (const dep of Object.values(node.dependencies)) {
                count += this.countUrlsInNode(dep);
            }
        }
        return count;
    }

    public getTree(): any {
        return this.tree;
    }

    public getFlatList(): { [packageName: string]: PackageInfo } {
        const flatList: { [packageName: string]: PackageInfo } = {};
        
        const containers = [
            this.tree.dependencies,
            this.tree.devDependencies,
            this.tree.peerDependencies || {},
            this.tree.optionalDependencies || {}
        ];

        for (const container of containers) {
            for (const dep of Object.values(container)) {
                this.flattenNode(dep, flatList);
            }
        }
        
        return flatList;
    }

    private flattenNode(node: DependencyTreeNode, flatList: { [packageName: string]: PackageInfo }): void {
        flatList[node.name] = {
            name: node.name,
            version: node.version,
            path: node.path,
            depth: node.depth,
            dependencyType: node.dependencyType,
            urls: node.urls
        };
        
        if (node.dependencies) {
            for (const dep of Object.values(node.dependencies)) {
                this.flattenNode(dep, flatList);
            }
        }
    }

    public getDependencyPath(packageName: string): string[] {
        const path: string[] = [];
        
        const findPath = (containers: { [key: string]: DependencyTreeNode }[], target: string, currentPath: string[]): boolean => {
            for (const container of containers) {
                for (const [name, dep] of Object.entries(container)) {
                    if (dep.name === target) {
                        path.push(...currentPath, dep.name);
                        return true;
                    }
                    
                    if (dep.dependencies) {
                        if (findPath([dep.dependencies], target, [...currentPath, dep.name])) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        
        const containers = [
            this.tree.dependencies,
            this.tree.devDependencies,
            this.tree.peerDependencies || {},
            this.tree.optionalDependencies || {}
        ];
        
        findPath(containers, packageName, []);
        return path;
    }
}
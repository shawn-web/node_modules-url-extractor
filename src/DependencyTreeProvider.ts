import * as vscode from 'vscode';
import * as path from 'path';
import { DependencyDetailProvider } from './DependencyDetailProvider';

export class DependencyTreeProvider implements vscode.TreeDataProvider<DependencyItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DependencyItem | undefined | null | void> = new vscode.EventEmitter<DependencyItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DependencyItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private treeData: any;
    private detailProvider: DependencyDetailProvider;

    private treeView: vscode.TreeView<DependencyItem>;

    constructor() {
        this.detailProvider = new DependencyDetailProvider();
        
        // 注册树视图并监听点击事件
        this.treeView = vscode.window.createTreeView('nodeModulesExtractor.tree', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        
        // 监听树项点击事件
        this.treeView.onDidChangeSelection(e => {
            if (e.selection.length > 0) {
                const item = e.selection[0];
                if (item.contextValue === 'urlItem' && item.url) {
                    console.log('点击URL:', item.url);
                    this.openUrlInBrowser(item.url);
                }
            }
        });

        // 添加双击事件监听
        this.treeView.onDidCollapseElement(e => {
            console.log('折叠元素:', e.element.label);
        });

        this.treeView.onDidExpandElement(e => {
            console.log('展开元素:', e.element.label);
        });
    }

refresh(treeData?: any): void {
    this.treeData = treeData;
    this._onDidChangeTreeData.fire();
}

// 获取当前的树数据，用于详情显示
public getCurrentTreeData(): any {
    return this.treeData;
}

    getTreeItem(element: DependencyItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DependencyItem): Thenable<DependencyItem[]> {
        if (!element) {
            // 根节点
            if (!this.treeData) {
                return Promise.resolve([]);
            }
            return Promise.resolve(this.getRootItems());
        } else {
            // 子节点
            return Promise.resolve(this.getChildItems(element));
        }
    }

    private getRootItems(): DependencyItem[] {
        const items: DependencyItem[] = [];
        
        // 检查treeData是否存在
        if (!this.treeData) {
            console.log('树数据为空，无法显示项目');
            return items;
        }
        
        console.log('树数据结构:', JSON.stringify(this.treeData, null, 2));
        
        // 按依赖类型分组显示顶级依赖
        const depTypes = [
            { key: 'dependencies', name: '生产依赖', icon: '📦' },
            { key: 'devDependencies', name: '开发依赖', icon: '🛠️' },
            { key: 'peerDependencies', name: '对等依赖', icon: '🤝' },
            { key: 'optionalDependencies', name: '可选依赖', icon: '⚡' }
        ];

        for (const depType of depTypes) {
            const depData = this.treeData[depType.key];
            console.log(`检查 ${depType.key}:`, depData);
            
            if (depData && typeof depData === 'object' && Object.keys(depData).length > 0) {
                // 为每个依赖类型创建分组标题，设置为可折叠
                const groupItem = new DependencyItem(
                    `${depType.icon} ${depType.name} (${Object.keys(depData).length})`,
                    '',
                    vscode.TreeItemCollapsibleState.Collapsed
                );
                groupItem.contextValue = 'dependencyGroupItem';
                groupItem.packageData = { dependencies: depData };
                groupItem.dependencyType = depType.key;
                items.push(groupItem);
                console.log(`添加分组: ${depType.name}`);
            }
        }
        
        // 如果没有任何依赖类型的数据，显示提示信息
        if (items.length === 0) {
            console.log('未找到任何依赖数据，检查树结构是否正确');
            // 检查是否有根节点或其他结构
            if (this.treeData.root && this.treeData.root.dependencies) {
                console.log('发现根节点结构，尝试处理');
                const rootItem = new DependencyItem(
                    '📦 所有依赖',
                    '',
                    vscode.TreeItemCollapsibleState.Collapsed
                );
                rootItem.contextValue = 'dependencyGroupItem';
                rootItem.packageData = { dependencies: this.treeData.root.dependencies };
                rootItem.dependencyType = 'all';
                items.push(rootItem);
            } else {
                // 显示无数据提示
                const noDataItem = new DependencyItem(
                    'ℹ️ 未找到依赖数据',
                    '',
                    vscode.TreeItemCollapsibleState.None
                );
                noDataItem.contextValue = 'noData';
                items.push(noDataItem);
            }
        }

        console.log(`根节点项目数量: ${items.length}`);
        return items;
    }

    private getChildItems(element: DependencyItem): DependencyItem[] {
        const items: DependencyItem[] = [];

        if (element.contextValue === 'dependencyGroupItem') {
            // 显示分组下的所有依赖包
            const packageData = element.packageData;
            if (!packageData || !packageData.dependencies) {
                return items;
            }

            for (const [name, dep] of Object.entries(packageData.dependencies)) {
                const packageItem = new DependencyItem(
                    `📦 ${name}`,
                    '',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    {
                        command: 'nodeModulesExtractor.showPackageDetail',
                        title: '显示包详情',
                        arguments: [dep, name]
                    }
                );
                packageItem.contextValue = 'packageItem';
                packageItem.packageData = dep;
                packageItem.dependencyType = element.dependencyType;
                items.push(packageItem);
            }
        } else if (element.contextValue === 'packageItem') {
            // 显示包的详细信息
            const packageData = element.packageData;
            
            if (!packageData) {
                return items;
            }
            
            // 如果有URL信息，创建链接组合项
            if (packageData.urls && typeof packageData.urls === 'object' && Object.keys(packageData.urls).length > 0) {
                const urlsItem = new DependencyItem(
                    '🔗 链接信息',
                    '',
                    vscode.TreeItemCollapsibleState.Collapsed
                );
                urlsItem.contextValue = 'urlsItem';
                urlsItem.packageData = packageData;
                items.push(urlsItem);
            }

            // 如果有子依赖，直接作为子节点显示
            if (packageData.dependencies && typeof packageData.dependencies === 'object' && Object.keys(packageData.dependencies).length > 0) {
                for (const [name, dep] of Object.entries(packageData.dependencies)) {
                    const depItem = new DependencyItem(
                        `📦 ${name}`,
                        '',
                        vscode.TreeItemCollapsibleState.Collapsed,
                        {
                            command: 'nodeModulesExtractor.showPackageDetail',
                            title: '显示包详情',
                            arguments: [dep, name]
                        }
                    );
                    depItem.contextValue = 'packageItem';
                    depItem.packageData = dep;
                    items.push(depItem);
                }
            }

            // 如果没有详细信息，显示提示
            if (!packageData.urls && !packageData.dependencies) {
                const noInfoItem = new DependencyItem(
                    'ℹ️ 无详细信息',
                    '',
                    vscode.TreeItemCollapsibleState.None
                );
                noInfoItem.contextValue = 'noInfo';
                items.push(noInfoItem);
            }
        } else if (element.contextValue === 'urlsItem') {
            // 显示所有URL
            const packageData = element.packageData;
            if (!packageData || !packageData.urls || typeof packageData.urls !== 'object') {
                return items;
            }
            
            const urlTypes = [
                { key: 'homepage', name: '主页', icon: '🏠' },
                { key: 'repository', name: '代码仓库', icon: '📁' },
                { key: 'bugs', name: '问题反馈', icon: '🐛' },
                { key: 'documentation', name: '文档', icon: '📚' }
            ];

        for (const urlType of urlTypes) {
            const url = packageData.urls[urlType.key];
            if (url && this.isValidUrl(url)) {
                const urlItem = new DependencyItem(
                    `${urlType.icon} ${urlType.name}: ${url}`,
                    url,
                    vscode.TreeItemCollapsibleState.None,
                    {
                        command: 'nodeModulesExtractor.openUrl',
                        title: '打开链接',
                        arguments: [url]
                    }
                );
                urlItem.contextValue = 'urlItem';
                urlItem.tooltip = `点击打开: ${url}`;
                items.push(urlItem);
            }
        }
        } else if (element.contextValue === 'packageItem') {
            // 显示子依赖（递归处理）
            const packageData = element.packageData;
            if (packageData && packageData.dependencies && typeof packageData.dependencies === 'object') {
                for (const [name, dep] of Object.entries(packageData.dependencies)) {
                    const depItem = new DependencyItem(
                        `📦 ${name}`,
                        '',
                        vscode.TreeItemCollapsibleState.Collapsed,
                        {
                            command: 'nodeModulesExtractor.showPackageDetail',
                            title: '显示包详情',
                            arguments: [dep, name]
                        }
                    );
                    depItem.contextValue = 'packageItem';
                    depItem.packageData = dep;
                    items.push(depItem);
                }
            }

        } else if (element.contextValue === 'urlTypeItem') {
            // 显示特定类型的所有URL
            const type = element.urlType;
            const urls = this.getUrlsByType(this.treeData, type || '');
                urls.forEach(item => {
                    const urlItem = new DependencyItem(
                        `📦 ${item.packageName}: ${item.url}`,
                        item.url || '',
                        vscode.TreeItemCollapsibleState.None
                    );
                    urlItem.contextValue = 'urlItem';
                    urlItem.tooltip = `点击打开: ${item.url}`;
                    items.push(urlItem);
                });
        }

        return items;
    }

    private countUrlsByType(tree: any, type: string): number {
        let count = 0;
        
        const countRecursive = (node: any) => {
            if (node.urls && node.urls[type]) {
                count++;
            }
            if (node.dependencies) {
                Object.values(node.dependencies).forEach((dep: any) => countRecursive(dep));
            }
        };
        
        if (tree.dependencies) {
            Object.values(tree.dependencies).forEach((dep: any) => countRecursive(dep));
        }
        
        return count;
    }

    private getUrlsByType(tree: any, type: string): any[] {
        const urls: any[] = [];
        
        const collectUrls = (node: any) => {
            if (node.urls && node.urls[type]) {
                urls.push({
                    packageName: node.name,
                    url: node.urls[type],
                    version: node.version
                });
            }
            if (node.dependencies) {
                Object.values(node.dependencies).forEach((dep: any) => collectUrls(dep));
            }
        };
        
        if (tree.dependencies) {
            Object.values(tree.dependencies).forEach((dep: any) => collectUrls(dep));
        }
        
        return urls;
    }

    private getUrlIcon(type: string): string {
        const icons: { [key: string]: string } = {
            homepage: '🏠',
            repository: '📁',
            bugs: '🐛',
            documentation: '📚'
        };
        return icons[type] || '🔗';
    }

    private getUrlTypeName(type: string): string {
        const names: { [key: string]: string } = {
            homepage: '主页',
            repository: '代码仓库',
            bugs: '问题反馈',
            documentation: '文档'
        };
        return names[type] || '其他';
    }

    private isValidUrl(url: string): boolean {
        if (!url || typeof url !== 'string') {
            return false;
        }

        // 清理URL
        let cleanUrl = url.trim();
        
        // 移除Git URL前缀
        if (cleanUrl.startsWith('git+')) {
            cleanUrl = cleanUrl.substring(4);
        }
        if (cleanUrl.startsWith('git://')) {
            cleanUrl = cleanUrl.replace('git://', 'https://');
        }
        if (cleanUrl.endsWith('.git')) {
            cleanUrl = cleanUrl.slice(0, -4);
        }

        // 检查是否是有效URL
        try {
            const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
            const allowedSchemes = ['http:', 'https:', 'mailto:'];
            return allowedSchemes.includes(urlObj.protocol);
        } catch {
            return false;
        }
    }

    private async openUrlInBrowser(url: string): Promise<void> {
        if (!url || typeof url !== 'string') {
            vscode.window.showErrorMessage('无效的URL');
            return;
        }

        try {
            // 清理和验证URL
            let cleanUrl = url.trim();
            
            // 移除可能的Git URL格式
            if (cleanUrl.startsWith('git+')) {
                cleanUrl = cleanUrl.substring(4);
            }
            if (cleanUrl.startsWith('git://')) {
                cleanUrl = cleanUrl.replace('git://', 'https://');
            }
            if (cleanUrl.endsWith('.git')) {
                cleanUrl = cleanUrl.slice(0, -4);
            }
            
            // 如果没有协议，添加https://
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('mailto:')) {
                cleanUrl = `https://${cleanUrl}`;
            }

            // 验证URL格式
            const uri = vscode.Uri.parse(cleanUrl);
            
            // 确保是支持的协议
            const supportedSchemes = ['http', 'https', 'mailto'];
            if (!supportedSchemes.includes(uri.scheme)) {
                vscode.window.showErrorMessage(`不支持的URL协议: ${uri.scheme}`);
                return;
            }

            // 打开URL
            await vscode.env.openExternal(uri);
        } catch (error) {
            vscode.window.showErrorMessage(`URL格式错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
}

export class DependencyItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly url: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}${this.url ? ` - ${this.url}` : ''}`;
        if (this.url) {
            this.resourceUri = vscode.Uri.parse(this.url);
        }
    }

    contextValue: string = 'dependencyItem';
    public packageData?: any;
    public urlType?: string;
    public dependencyType?: string;
}
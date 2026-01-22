import * as vscode from 'vscode';
import * as path from 'path';
import { DependencyDetailProvider } from './DependencyDetailProvider';
import { I18n } from './i18n/I18n';

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
                    console.log('Click URL:', item.url);
                    this.openUrlInBrowser(item.url);
                }
            }
        });

        // 添加双击事件监听
        this.treeView.onDidCollapseElement(e => {
            console.log('Collapse element:', e.element.label);
        });

        this.treeView.onDidExpandElement(e => {
            console.log('Expand element:', e.element.label);
        });
    }

refresh(treeData?: any): void {
    this.treeData = treeData;
    this._onDidChangeTreeData.fire();
}

/**
 * 📊 计算总的依赖数量
 */
private calculateTotalDependencies(treeData: any): number {
    if (!treeData || typeof treeData !== 'object') {
        return 0;
    }

    let totalCount = 0;
    
    // 统计各类型依赖的数量
    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
    
    for (const depType of depTypes) {
        const depData = treeData[depType];
        if (depData && typeof depData === 'object') {
            totalCount += Object.keys(depData).length;
        }
    }
    
    // 如果有根节点结构，也进行统计
    if (treeData.root && treeData.root.dependencies) {
        totalCount += Object.keys(treeData.root.dependencies).length;
    }
    
    return totalCount;
}

/**
 * 📈 计算各类型依赖的数量
 */
private calculateDependencyTypeCounts(treeData: any): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    
    // 统计各类型依赖的数量
    const depTypes = [
        { key: 'dependencies', name: I18n.t('dependencies') },
        { key: 'devDependencies', name: I18n.t('devDependencies') },
        { key: 'peerDependencies', name: I18n.t('peerDependencies') },
        { key: 'optionalDependencies', name: I18n.t('optionalDependencies') }
    ];
    
    for (const depType of depTypes) {
        const depData = treeData[depType.key];
        if (depData && typeof depData === 'object') {
            counts[depType.name] = Object.keys(depData).length;
        }
    }
    
    return counts;
}

/**
 * 💬 生成统计信息的tooltip
 */
private generateSummaryTooltip(typeCounts: { [key: string]: number }): string {
    const lines = [I18n.t('dependencyStatistics')];
    
    for (const [type, count] of Object.entries(typeCounts)) {
        if (count > 0) {
            lines.push(`  • ${type}: ${count}`);
        }
    }
    
    return lines.join('\n');
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
            console.log('Tree data is empty, cannot display items');
            return items;
        }
        
        console.log('Tree data structure:', JSON.stringify(this.treeData, null, 2));
        
        // 📊 计算总数并添加顶部统计项
        const totalCount = this.calculateTotalDependencies(this.treeData);
        if (totalCount > 0) {
            const typeCounts = this.calculateDependencyTypeCounts(this.treeData);
            const summaryTooltip = this.generateSummaryTooltip(typeCounts);
            
            const summaryItem = new DependencyItem(
                `📊 ${I18n.t('dependencyStatistics')}: ${totalCount}`,
                '',
                vscode.TreeItemCollapsibleState.Expanded
            );
            summaryItem.contextValue = 'summaryItem';
            summaryItem.tooltip = summaryTooltip;
            items.push(summaryItem);
        }
        
        // 按依赖类型分组显示顶级依赖
        const depTypes = [
            { key: 'dependencies', name: I18n.t('dependencies'), icon: '📦' },
            { key: 'devDependencies', name: I18n.t('devDependencies'), icon: '🛠️' },
            { key: 'peerDependencies', name: I18n.t('peerDependencies'), icon: '🤝' },
            { key: 'optionalDependencies', name: I18n.t('optionalDependencies'), icon: '⚡' }
        ];

        for (const depType of depTypes) {
            const depData = this.treeData[depType.key];
            console.log(`Checking ${depType.key}:`, depData);
            
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
                console.log(`Added group: ${depType.name}`);
            }
        }
        
        // 如果没有任何依赖类型的数据，显示提示信息
        if (items.length === 0) {
            console.log('No dependency data found, checking tree structure');
            // 检查是否有根节点或其他结构
            if (this.treeData.root && this.treeData.root.dependencies) {
                console.log('Found root node structure, attempting to process');
                const rootItem = new DependencyItem(
                    `📦 ${I18n.t('allDependencies')}`,
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
                    `ℹ️ ${I18n.t('noDataMessage')}`,
                    '',
                    vscode.TreeItemCollapsibleState.None
                );
                noDataItem.contextValue = 'noData';
                items.push(noDataItem);
            }
        }

        console.log(`Root node item count: ${items.length}`);
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
                        title: I18n.t('showPackageDetails'),
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
                    `🔗 ${I18n.t('linkInformation')}`,
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
                            title: I18n.t('showPackageDetails'),
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
                    `ℹ️ ${I18n.t('noDetailedInfo')}`,
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
                { key: 'homepage', name: I18n.t('homepage'), icon: '🏠' },
                { key: 'repository', name: I18n.t('repository'), icon: '📁' },
                { key: 'bugs', name: I18n.t('bugs'), icon: '🐛' },
                { key: 'documentation', name: I18n.t('documentation'), icon: '📚' }
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
                        title: I18n.t('clickToOpen'),
                        arguments: [url]
                    }
                );
                urlItem.contextValue = 'urlItem';
                urlItem.tooltip = `${I18n.t('clickToOpen')}: ${url}`;
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
                            title: I18n.t('showPackageDetails'),
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
                    urlItem.tooltip = `${I18n.t('clickToOpen')}: ${item.url}`;
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
            homepage: I18n.t('homepage'),
            repository: I18n.t('repository'),
            bugs: I18n.t('bugs'),
            documentation: I18n.t('documentation')
        };
        return names[type] || I18n.t('other');
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
            vscode.window.showErrorMessage(I18n.t('invalidUrl'));
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
                vscode.window.showErrorMessage(`${I18n.t('unsupportedProtocol')}: ${uri.scheme}`);
                return;
            }

            // 打开URL
            await vscode.env.openExternal(uri);
        } catch (error) {
            vscode.window.showErrorMessage(`${I18n.t('urlFormatError')}: ${error instanceof Error ? error.message : I18n.t('unknown')}`);
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
        // 为URL项添加统一的tooltip格式
        if (this.url) {
            this.tooltip = `${I18n.t('clickToOpen')}: ${this.url}`;
        } else {
            this.tooltip = this.label;
        }
        if (this.url) {
            this.resourceUri = vscode.Uri.parse(this.url);
        }
    }

    contextValue: string = 'dependencyItem';
    public packageData?: any;
    public urlType?: string;
    public dependencyType?: string;
}
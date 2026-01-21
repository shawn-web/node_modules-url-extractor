import * as vscode from 'vscode';
import { NodeModulesExtractor } from './NodeModulesExtractor';
import { DependencyDetailProvider } from './DependencyDetailProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Node Modules URL Extractor 插件已激活');

    const extractor = new NodeModulesExtractor(context);
    
    // 创建全局的详情提供者实例，确保重用同一个面板
    const detailProvider = new DependencyDetailProvider();

    // 注册命令
    const extractCommand = vscode.commands.registerCommand('nodeModulesExtractor.extractUrls', () => {
        extractor.extractAllUrls();
    });

    const configureCommand = vscode.commands.registerCommand('nodeModulesExtractor.configure', () => {
        extractor.showConfiguration();
    });

    const toggleCommand = vscode.commands.registerCommand('nodeModulesExtractor.toggleMonitoring', () => {
        extractor.toggleMonitoring();
    });



    const refreshCommand = vscode.commands.registerCommand('nodeModulesExtractor.refresh', () => {
        extractor.refresh();
    });

    const showStatisticsCommand = vscode.commands.registerCommand('nodeModulesExtractor.showStatistics', (stats: any) => {
        const message = `统计信息:\n总包数: ${stats.totalPackages}\n包含URL的包: ${stats.packagesWithUrls}\n最大深度: ${stats.maxDepth}\nURL总数: ${stats.totalUrls}`;
        vscode.window.showInformationMessage(message);
    });

    const showUrlTypeCommand = vscode.commands.registerCommand('nodeModulesExtractor.showUrlType', (type: string, tree: any) => {
        vscode.window.showInformationMessage(`显示 ${type} 类型的URL`);
    });

    const showPackageDetailCommand = vscode.commands.registerCommand('nodeModulesExtractor.showPackageDetail', (packageData: any, packageName: string) => {
        const treeData = extractor.getCurrentTreeData();
        const dependencyTree = extractor.getCurrentDependencyTree();
        detailProvider.showDetail(packageData, packageName, treeData, dependencyTree);
    });

    const manageExclusionsCommand = vscode.commands.registerCommand('nodeModulesExtractor.manageExclusions', () => {
        extractor.manageExclusions();
    });

    const openUrlCommand = vscode.commands.registerCommand('nodeModulesExtractor.openUrl', (url: string) => {
        if (url) {
            vscode.env.openExternal(vscode.Uri.parse(url));
        }
    });

    context.subscriptions.push(extractCommand, configureCommand, toggleCommand, refreshCommand, showStatisticsCommand, showUrlTypeCommand, showPackageDetailCommand, manageExclusionsCommand, openUrlCommand);

    // 启动监测
    extractor.startMonitoring();
}

export function deactivate() {
    console.log('Node Modules URL Extractor 插件已停用');
}
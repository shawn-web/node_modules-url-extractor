import * as vscode from 'vscode';
import { NodeModulesExtractor } from './NodeModulesExtractor';
import { DependencyDetailProvider } from './DependencyDetailProvider';
import { I18n, SupportedLocale } from './i18n/I18n';

/**
 * 🚀 优先初始化语言系统 - 确保在任何其他操作之前完成语言设置
 */
function initializeLanguageSystem(): void {
    // 从设置中读取语言配置，如果没有设置则根据 VSCode 语言自动检测
    const config = vscode.workspace.getConfiguration('nodeModulesExtractor');
    const savedLocale = config.get<string>('language') as 'zh-CN' | 'en' | undefined;
    
    let targetLocale: 'zh-CN' | 'en';
    
    if (savedLocale) {
        targetLocale = savedLocale;
    } else {
        // 自动检测 VSCode 语言
        const vscodeLocale = vscode.env.language;
        if (vscodeLocale === 'zh-cn' || vscodeLocale.startsWith('zh-')) {
            targetLocale = 'zh-CN';
        } else {
            targetLocale = 'en';
        }
    }
    
    // 🌐 立即设置语言 - 确保后续所有操作都使用正确的语言
    I18n.setLocale(targetLocale);
    
    // 监听语言变更，为未来的实时更新做准备
    I18n.onLanguageChange((locale) => {
        console.log(`🔄 Language changed to: ${locale}`);
        // 注意：此时extractor还未创建，需要在activate函数中处理
    });
}

export function activate(context: vscode.ExtensionContext) {
    // 🚀 优先初始化语言系统 - 确保在任何UI或功能加载前完成
    initializeLanguageSystem();
    
    console.log(`${I18n.t('extensionName')} plugin activated (Language: ${I18n.getCurrentLocale()})`);
    
    // 📦 现在可以安全地创建需要语言系统的组件
    const extractor = new NodeModulesExtractor(context);
    
    // 🌐 在extractor创建后，重新设置语言监听器以更新UI
    I18n.onLanguageChange((locale) => {
        console.log(`🔄 Language changed to: ${locale}`);
        
        // 🔄 实时更新树视图中的依赖类型标签
        const treeData = extractor.getCurrentTreeData();
        if (treeData) {
            extractor.refreshTreeView();
        }
        
        // 更新状态栏
        extractor.updateStatusBar();
    });
    
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
        const message = I18n.tWithArgs('extractionCompleted', [stats.totalPackages || 0]);
        vscode.window.showInformationMessage(message);
    });

    const showUrlTypeCommand = vscode.commands.registerCommand('nodeModulesExtractor.showUrlType', (type: string, tree: any) => {
        const message = I18n.t('repository') + ': ' + type;
        vscode.window.showInformationMessage(message);
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

    const changeLanguageCommand = vscode.commands.registerCommand('nodeModulesExtractor.changeLanguage', () => {
        const options: vscode.QuickPickItem[] = [
            { label: '简体中文', description: 'Chinese (Simplified)', detail: 'zh-CN' },
            { label: 'English', description: 'English', detail: 'en' }
        ];
        
        vscode.window.showQuickPick(options, {
            placeHolder: I18n.t('changeLanguage')
        }).then(selected => {
            if (selected) {
                const config = vscode.workspace.getConfiguration('nodeModulesExtractor');
                config.update('language', selected.detail, vscode.ConfigurationTarget.Global);
                
                // 立即更新语言
                I18n.setLocale(selected.detail as SupportedLocale);
                
                vscode.window.showInformationMessage(I18n.tWithArgs('languageChanged', [selected.label]));
                
                // 实时更新UI元素
                extractor.updateStatusBar();
                extractor.refreshTreeView();
                
                // 语言已实时生效，无需重启
                console.log('✅ Language applied successfully in real-time');
            }
        });
    });

    context.subscriptions.push(extractCommand, configureCommand, toggleCommand, refreshCommand, showStatisticsCommand, showUrlTypeCommand, showPackageDetailCommand, manageExclusionsCommand, openUrlCommand, changeLanguageCommand);

    // 🚀 异步启动监测 - 不阻塞插件激活
    // 使用setImmediate确保语言系统完全初始化后再开始
    setImmediate(() => {
        extractor.startMonitoring();
    });
}

export function deactivate() {
    console.log('Node Modules URL Extractor plugin deactivated');
}
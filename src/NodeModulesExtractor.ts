import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PackageJsonParser } from './PackageJsonParser';
import { DependencyTree } from './DependencyTree';
import { MarkdownGenerator } from './MarkdownGenerator';
import { DependencyTreeProvider } from './DependencyTreeProvider';
import { IncrementalExtractor } from './IncrementalExtractor';
import { I18n } from './i18n/I18n';

export interface ExtractorConfig {
  maxDepth: number;
  outputFileName: string;
  outputFormat: string;
  autoMonitoring: boolean;
  extractOnStartup: boolean;
  initialDelay: number;
  includeFields: string[];
  excludedProjects: string[];
  autoDetectProjects: boolean;
  language?: string;
}

export interface ProjectStatus {
  hasNodeModules: boolean;
  isExcluded: boolean;
  nodeModulesPaths?: string[];
}

export interface PackageInfo {
  name: string;
  version: string;
  path: string;
  depth: number;
  parent?: string;
  dependencyType?: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
  urls: {
    homepage?: string;
    repository?: string;
    bugs?: string;
    documentation?: string;
    [key: string]: string | undefined;
  };
  description?: string;
  author?: any;
  license?: string;
  keywords?: string[];
  repository?: any;
  homepage?: string;
  bugs?: any;
}

/**
 * 🌐 多语言日志函数 - 确保日志使用正确的语言
 */
function log(message: string, ...args: any[]): void {
  // 日志使用英文，但用户界面消息使用I18n
  console.log(`[NodeModulesExtractor] ${message}`, ...args);
}

export class NodeModulesExtractor {
  private watcher: vscode.FileSystemWatcher | undefined;
  private statusBar: vscode.StatusBarItem;
  private isMonitoring: boolean = false;
  private isExtracting: boolean = false;
  private config: ExtractorConfig;
  private treeProvider: DependencyTreeProvider;
  private currentTreeData: any;
  private currentDependencyTree: DependencyTree | null = null;
  private incrementalExtractor: IncrementalExtractor | null = null;
  private workspaceRoots: string[] = [];
  private projectStatus: Map<string, ProjectStatus> = new Map();
  private workspaceNodeModules: Map<string, string[]> = new Map();

  constructor(private context: vscode.ExtensionContext) {
    // 🌐 语言系统已在extension.ts中初始化完成，这里可以安全使用
    this.config = this.loadConfiguration();
    this.treeProvider = new DependencyTreeProvider();
    
    // 创建状态栏项目 - 语言系统已就绪，可以正确显示文本
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.updateStatusBar();

    // 注册树视图并立即刷新
    const treeDataProvider = vscode.window.registerTreeDataProvider('nodeModulesExtractor.tree', this.treeProvider);
    this.context.subscriptions.push(treeDataProvider);

    // 监听配置变更
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('nodeModulesExtractor')) {
          this.handleConfigurationChange();
        }
      })
    );
  }

  private loadConfiguration(): ExtractorConfig {
    const config = vscode.workspace.getConfiguration('nodeModulesExtractor');
    return {
      maxDepth: config.get<number>('maxDepth', 1),
      outputFileName: config.get<string>('outputFileName', 'dependency-urls.md'),
      outputFormat: config.get<string>('outputFormat', 'markdown'),
      autoMonitoring: config.get<boolean>('autoMonitoring', true),
      extractOnStartup: config.get<boolean>('extractOnStartup', true),
      initialDelay: config.get<number>('initialDelay', 3000),
      includeFields: config.get<string[]>('includeFields', ['homepage', 'repository', 'bugs', 'documentation']),
      excludedProjects: config.get<string[]>('excludedProjects', []),
      autoDetectProjects: config.get<boolean>('autoDetectProjects', true),
      language: config.get<string>('language', 'zh-CN')
    };
  }

  private async initializeWorkspaces(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      console.log(I18n.t('noWorkspaceFound'));
      return;
    }

    this.workspaceRoots = workspaceFolders.map(folder => folder.uri.fsPath);
    this.projectStatus.clear();
    
    log(`Workspace roots: ${this.workspaceRoots}`);

    // 检查每个工作区
    for (const root of this.workspaceRoots) {
      log(`Processing workspace: ${root}`);
      const isExcluded = this.config.excludedProjects.some(excluded =>
        root.includes(excluded) || excluded.includes(root)
      );
      console.log(`工作区 ${root} 是否被排除: ${isExcluded}`);
      
      // 递归查找 node_modules 目录
      console.log(`开始递归查找 node_modules 在 ${root}`);
      const nodeModulesPaths = this.findNodeModulesRecursively(root);
      const hasNodeModules = nodeModulesPaths.length > 0;
      console.log(`找到 ${nodeModulesPaths.length} 个 node_modules 路径:`, nodeModulesPaths);

        // 为每个找到的 node_modules 创建项目状态
        if (hasNodeModules) {
          this.projectStatus.set(root, { hasNodeModules, isExcluded, nodeModulesPaths });
          
          // 存储找到的所有 node_modules 路径，用于后续处理
          if (!this.workspaceNodeModules) {
            this.workspaceNodeModules = new Map();
          }
          this.workspaceNodeModules.set(root, nodeModulesPaths);
          
          console.log(`✅ 在 ${root} 中找到 ${nodeModulesPaths.length} 个 node_modules:`, nodeModulesPaths);
        } else {
          this.projectStatus.set(root, { hasNodeModules, isExcluded, nodeModulesPaths: [] });
            console.log(`❌ ${I18n.t('noNodeModulesFound')} in ${root}`);
        }
    }
  }

  private findNodeModulesRecursively(dirPath: string, maxDepth: number = 5, currentDepth: number = 0): string[] {
    if (currentDepth > maxDepth) {
      return [];
    }

    const foundPaths: string[] = [];
    
    try {
      console.log(`正在搜索目录: ${dirPath} (深度: ${currentDepth})`);
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // 如果是 node_modules 目录，添加到结果中
          if (entry.name === 'node_modules') {
            foundPaths.push(fullPath);
            console.log(`找到 node_modules: ${fullPath}`);
          }
          // 递归查找子目录（排除一些常见的忽略目录）
          else if (!this.shouldIgnoreDirectory(entry.name)) {
            const subPaths = this.findNodeModulesRecursively(fullPath, maxDepth, currentDepth + 1);
            foundPaths.push(...subPaths);
          }
        }
      }
    } catch (error) {
      console.warn(`读取目录失败: ${dirPath}`, error);
    }
    
    return foundPaths;
  }

  private shouldIgnoreDirectory(dirName: string): boolean {
    const ignoreDirs = [
      '.git', '.vscode', '.idea', 'node_modules', 'dist', 'build',
      'coverage', '.nyc_output', '.next', '.nuxt', '.vuepress',
      '__pycache__', '.pytest_cache', 'venv', 'env'
    ];
    const shouldIgnore = ignoreDirs.includes(dirName) || dirName.startsWith('.');
    console.log(`检查目录 ${dirName}, 是否忽略: ${shouldIgnore}`);
    return shouldIgnore;
  }

  private getValidProjects(): string[] {
    const validProjects: string[] = [];

    for (const [root, status] of this.projectStatus) {
      if (status.hasNodeModules && !status.isExcluded) {
        validProjects.push(root);
      }
    }

    return validProjects;
  }

  private getNodeModulesPaths(rootPath: string): string[] {
    const status = this.projectStatus.get(rootPath);
    return status?.nodeModulesPaths || [];
  }

  public startMonitoring(): void {
    // 先初始化工作区，确保能找到node_modules
    this.initializeWorkspaces().then(() => {
      if (this.config.extractOnStartup) {
        // 延迟提取，等待VSCode完全启动
        setTimeout(() => {
          this.extractAllUrls(true);
        }, this.config.initialDelay);
      }

      if (this.config.autoMonitoring && !this.isMonitoring) {
        this.enableMonitoring();
      }
    });
  }

  public toggleMonitoring(): void {
    if (this.isMonitoring) {
      this.disableMonitoring();
    } else {
      this.enableMonitoring();
    }
  }

  private enableMonitoring(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showWarningMessage(I18n.t('noWorkspaceFound'));
      return;
    }

    // 重新初始化工作区以查找所有 node_modules
    this.initializeWorkspaces().then(() => {
      const validProjects = this.getValidProjects();
      if (validProjects.length === 0) {
        vscode.window.showWarningMessage(I18n.t('noNodeModulesFound'));
        return;
      }

      // 为每个有效项目创建监视器
      const watchers: vscode.FileSystemWatcher[] = [];
      
      for (const root of validProjects) {
        // 监视根目录的package.json
        watchers.push(
          vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(root, 'package.json')
          )
        );
        
        // 监视每个找到的 node_modules 中的 package.json
        const nodeModulesPaths = this.getNodeModulesPaths(root);
        for (const nodeModulesPath of nodeModulesPaths) {
          const relativePattern = path.relative(root, nodeModulesPath);
          watchers.push(
            vscode.workspace.createFileSystemWatcher(
              new vscode.RelativePattern(root, `${relativePattern}/**/package.json`)
            )
          );
        }
      }

      // 监听所有文件变化
      watchers.forEach(watcher => {
        watcher.onDidChange((uri) => this.handleFileChange(uri));
        watcher.onDidCreate((uri) => this.handleFileChange(uri));
        watcher.onDidDelete((uri) => this.handleFileChange(uri));
        this.context.subscriptions.push(watcher);
      });

      // 初始化增量提取器（使用第一个有效项目）
      this.incrementalExtractor = new IncrementalExtractor(this.config, validProjects[0]);

      this.isMonitoring = true;
      this.updateStatusBar();
      vscode.window.showInformationMessage(I18n.tWithArgs('monitoringStarted', [validProjects.length.toString()]));

      // 初始提取
      this.extractAllUrls();
    }).catch(error => {
      vscode.window.showErrorMessage('初始化工作区失败: ' + error);
    });
  }

  private disableMonitoring(): void {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = undefined;
    }
    this.isMonitoring = false;
    this.updateStatusBar();
     vscode.window.showInformationMessage(I18n.t('monitoringStopped'));
  }

  public refreshTreeView(): void {
    // 🔄 刷新树视图，更新依赖类型标签
    if (this.treeProvider && this.currentTreeData) {
      this.treeProvider.refresh(this.currentTreeData);
    }
  }

  public updateStatusBar(): void {
    // 使用不同的图标和颜色来区分监测状态
    if (this.isMonitoring) {
      this.statusBar.text = `$(eye) ${I18n.t('statusBarMonitoring')}`;
      this.statusBar.tooltip = I18n.t('statusBarTooltipOn');
      this.statusBar.color = '#4CAF50'; // 绿色表示正在监测
    } else {
      this.statusBar.text = `$(eye) ${I18n.t('statusBarNotMonitoring')}`;
      this.statusBar.tooltip = I18n.t('statusBarTooltipOff');
      this.statusBar.color = '#cccccc'; // 灰色表示未监测
    }
    this.statusBar.command = 'nodeModulesExtractor.toggleMonitoring';
    this.statusBar.show();
  }

  private handleConfigurationChange(): void {
    const oldConfig = this.config;
    this.config = this.loadConfiguration();
    
    console.log(`配置变更: maxDepth ${oldConfig.maxDepth} -> ${this.config.maxDepth}`);
    
    // 检测语言变更
    const languageChanged = oldConfig.language !== this.config.language;
    if (languageChanged && this.config.language) {
      // 语言设置变更，立即应用新语言
      import('./i18n/I18n').then(({ I18n }) => {
        I18n.setLocale(this.config.language as 'zh-CN' | 'en');
        
        const languageName = this.config.language === 'zh-CN' ? '简体中文' : 'English';
        vscode.window.showInformationMessage(I18n.tWithArgs('languageChanged', [languageName]));
        
        // 刷新UI以应用新语言
        this.refreshTreeView();
        this.updateStatusBar();
        
        // 语言已实时生效，无需重启
        console.log('✅ Language applied successfully from settings');
      });
    }

    // 如果maxDepth或其他关键配置发生变化，强制重新提取
    const configChanged = oldConfig.maxDepth !== this.config.maxDepth || 
                         oldConfig.includeFields.join(',') !== this.config.includeFields.join(',');

    if (configChanged) {
      // 重置缓存数据，强制重新解析
      this.currentTreeData = null;
      if (this.incrementalExtractor) {
        this.incrementalExtractor = null;
      }
      
      // 重新初始化工作区（这会重新查找 node_modules）
      this.initializeWorkspaces().then(() => {
         vscode.window.showInformationMessage(I18n.tWithArgs('configurationUpdated', [this.config.maxDepth.toString()]));
        this.extractAllUrls().then(() => {
          // 确保树视图更新
          console.log('依赖提取完成，树数据已更新');
        });
      }).catch(error => {
        console.error('重新初始化工作区失败:', error);
        vscode.window.showErrorMessage('重新初始化工作区失败: ' + error);
      });
    }
    
    // 更新状态栏
    this.updateStatusBar();
    
    // 如果自动监测配置改变，重新启动监测
    if (oldConfig.autoMonitoring !== this.config.autoMonitoring) {
      if (this.config.autoMonitoring && !this.isMonitoring) {
        this.enableMonitoring();
      } else if (!this.config.autoMonitoring && this.isMonitoring) {
        this.disableMonitoring();
      }
    }
  }

  private handleFileChange(uri: vscode.Uri): void {
    if (!this.isMonitoring || this.isExtracting) {
      return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const relativePath = path.relative(workspaceRoot, uri.fsPath);

    // 检查是否是根目录的package.json
    if (relativePath === 'package.json') {
      setTimeout(() => {
        vscode.window.showInformationMessage(I18n.t('packageJsonChanged'));
        this.extractAllUrls();
      }, 1000);
    } 
    // 检查是否是node_modules中的package.json变化
    else if (relativePath.startsWith('node_modules') && relativePath.endsWith('package.json') && this.incrementalExtractor) {
      setTimeout(() => {
        this.extractChangedPackages([uri]);
      }, 1000);
    }
  }

  private onNodeModulesChanged(): void {
    // 保留原方法以防兼容性问题
    if (this.isMonitoring && !this.isExtracting) {
      // 使用延迟避免频繁变化时的重复提取
      setTimeout(() => {
        vscode.window.showInformationMessage(I18n.t('nodeModulesChanged'));
        this.extractAllUrls();
      }, 1000);
    }
  }

  public async extractAllUrls(isStartup: boolean = false): Promise<void> {
    // 初始化工作区
    await this.initializeWorkspaces();
    
    console.log('工作区初始化完成，项目状态:', Array.from(this.projectStatus.entries()));

    // 防止重复提取
    if (this.isExtracting) {
      return;
    }

    // 检查有node_modules的项目
    const validProjects = this.getValidProjects();
    console.log('有效项目:', validProjects);
    
    if (validProjects.length === 0) {
      if (isStartup) {
        // 启动时不显示错误，静默跳过
        return;
      }
      vscode.window.showInformationMessage(I18n.t('noProjectsAvailable'));
      return;
    }

    this.isExtracting = true;

    try {
      const dependencyTree = new DependencyTree();

      const progressTitle = isStartup ? '初始化依赖文档...' : '正在提取依赖URL...';

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: progressTitle,
        cancellable: false
      }, async (progress) => {
        progress.report({ increment: 0, message: '开始扫描...' });

        // 处理所有有效项目
        let allPackages: PackageInfo[] = [];

        for (const projectRoot of validProjects) {
          // 获取当前项目的 node_modules 路径
          const nodeModulesPaths = this.getNodeModulesPaths(projectRoot);
          const parser = new PackageJsonParser(this.config, nodeModulesPaths);
          
          const packages = await parser.extractAllPackages(projectRoot, (current, total) => {
            progress.report({
              increment: (current / total) * 100 / validProjects.length,
              message: `扫描 ${path.basename(projectRoot)}: ${current}/${total} 个包`
            });
          });
          allPackages = allPackages.concat(packages);
        }

        dependencyTree.buildTree(allPackages);
        this.currentTreeData = dependencyTree.getTree();
        this.currentDependencyTree = dependencyTree;

        // 保存到缓存（使用第一个项目作为缓存位置）
        if (this.incrementalExtractor && validProjects.length > 0) {
          this.incrementalExtractor.setFullScanResult(allPackages);
        }

        // 为每个项目保存结果
        for (const projectRoot of validProjects) {
          await this.saveResults(this.currentTreeData, projectRoot, dependencyTree);
        }

        this.treeProvider.refresh(this.currentTreeData);
        console.log('树数据已刷新，包数量:', this.countPackages(this.currentTreeData));
        
        // 确保树视图有数据时强制触发重新渲染
        if (this.currentTreeData && Object.keys(this.currentTreeData).length > 0) {
          setTimeout(() => {
            this.treeProvider.refresh(this.currentTreeData);
            console.log('延迟刷新树视图完成');
          }, 100);
        }
      });

      if (!isStartup) {
        vscode.window.showInformationMessage(I18n.tWithArgs('extractionCompleted', [this.config.outputFileName]));
      } else {
        // 启动完成后显示简短提示
        vscode.window.setStatusBarMessage(`✅ ${I18n.tWithArgs('extractionCompleted', [this.config.outputFileName])}`, 3000);
      }
    } catch (error) {
      const errorMsg = `${I18n.t('errorExtractionFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      if (isStartup) {
        // 启动时的错误在状态栏显示
        vscode.window.setStatusBarMessage(`❌ ${errorMsg}`, 5000);
      } else {
        vscode.window.showErrorMessage(errorMsg);
      }
    } finally {
      this.isExtracting = false;
    }
  }

  private async saveResults(tree: any, rootPath: string, dependencyTree?: DependencyTree): Promise<void> {
    const outputPath = path.join(rootPath, this.config.outputFileName);

    if (this.config.outputFormat === 'markdown') {
      const markdownGenerator = new MarkdownGenerator(this.config, dependencyTree);
      const markdownContent = markdownGenerator.generateMarkdown(tree);
      fs.writeFileSync(outputPath, markdownContent, 'utf-8');
    } else {
      const outputData = {
        extractedAt: new Date().toISOString(),
        configuration: this.config,
        totalPackages: this.countPackages(tree),
        tree: tree
      };
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    }
  }

  private countPackages(tree: any): number {
    let count = 0;
    const countRecursive = (obj: any) => {
      if (obj.packages) {
        count += Object.keys(obj.packages).length;
        Object.values(obj.packages).forEach((pkg: any) => {
          if (pkg.dependencies) {
            countRecursive(pkg.dependencies);
          }
        });
      }
    };
    countRecursive(tree);
    return count;
  }

  public showConfiguration(): void {
    vscode.window.showInformationMessage(I18n.t('configurationInDevelopment'), I18n.t('openSettings')).then(selection => {
      if (selection === '打开设置') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'nodeModulesExtractor');
      }
    });
  }



  public async extractChangedPackages(changedFiles: vscode.Uri[]): Promise<void> {
    if (!this.incrementalExtractor || !this.currentTreeData) {
      return;
    }

    try {
      const changedPackages = await this.incrementalExtractor.extractChangedPackages(changedFiles);

      if (changedPackages.length === 0) {
        return; // 没有变更
      }

      // 更新依赖树
      await this.updateDependencyTree(changedPackages);

      // 显示变更提示
      vscode.window.showInformationMessage(I18n.tWithArgs('packagesUpdated', [changedPackages.length.toString()]));
    } catch (error) {
      vscode.window.showErrorMessage(I18n.tWithArgs('incrementalUpdateFailed', [error instanceof Error ? error.message : I18n.t('unknownError')]));
    }
  }

  private async updateDependencyTree(changedPackages: PackageInfo[]): Promise<void> {
    if (!this.currentTreeData || this.workspaceRoots.length === 0) {
      return;
    }

    // 更新树结构（简化实现，可以根据需要优化）
    for (const pkg of changedPackages) {
      this.updatePackageInTree(this.currentTreeData, pkg);
    }

    // 重新生成文档（为所有有效项目保存）
    const validProjects = this.getValidProjects();
    for (const projectRoot of validProjects) {
      await this.saveResults(this.currentTreeData, projectRoot);
    }

    this.treeProvider.refresh(this.currentTreeData);
  }

  private updatePackageInTree(node: any, updatedPackage: PackageInfo): void {
    if (node.name === 'root') {
      if (node.dependencies && node.dependencies[updatedPackage.name]) {
        // 更新现有包
        node.dependencies[updatedPackage.name] = {
          ...node.dependencies[updatedPackage.name],
          version: updatedPackage.version,
          urls: updatedPackage.urls
        };
      } else {
        // 添加新包
        node.dependencies[updatedPackage.name] = {
          name: updatedPackage.name,
          version: updatedPackage.version,
          path: updatedPackage.path,
          depth: updatedPackage.depth,
          urls: updatedPackage.urls,
          dependencies: {}
        };
      }
    } else if (node.dependencies) {
      // 递归查找并更新
      for (const dep of Object.values(node.dependencies)) {
        this.updatePackageInTree(dep, updatedPackage);
      }
    }
  }

  public refresh(): void {
    this.extractAllUrls();
  }

  public getCurrentTreeData(): any {
    return this.currentTreeData;
  }

  public getCurrentDependencyTree(): DependencyTree | null {
    return this.currentDependencyTree;
  }

  public getTreeProvider(): DependencyTreeProvider {
    return this.treeProvider;
  }

  public async manageExclusions(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showInformationMessage(I18n.t('noWorkspaceOpen'));
      return;
    }

    // 获取当前排除列表
    const currentExclusions = [...this.config.excludedProjects];

    // 提供可选的工作区路径
    const options = workspaceFolders.map(folder => ({
      label: folder.name,
      description: folder.uri.fsPath,
      path: folder.uri.fsPath
    }));

    if (currentExclusions.length > 0) {
      options.push({
        label: I18n.t('currentExcludedProjects'),
        description: '',
        path: ''
      });

      currentExclusions.forEach(excluded => {
        options.push({
          label: `🚫 ${path.basename(excluded)}`,
          description: excluded,
          path: excluded
        });
      });
    }

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: I18n.t('selectExclusionManagement'),
      canPickMany: false
    });

    if (selected) {
      if (selected.path) {
        // 检查是否已经在排除列表中
        const isExcluded = currentExclusions.includes(selected.path);

        if (isExcluded) {
          // 从排除列表中移除
          const newExclusions = currentExclusions.filter(excluded => excluded !== selected.path);
          await this.updateExclusionList(newExclusions);
          vscode.window.showInformationMessage(I18n.tWithArgs('removedFromExclusions', [selected.label]));
        } else {
          // 添加到排除列表
          const newExclusions = [...currentExclusions, selected.path];
          await this.updateExclusionList(newExclusions);
          vscode.window.showInformationMessage(I18n.tWithArgs('addedToExclusions', [selected.label]));
        }
      }
    }
  }

  private async updateExclusionList(newExclusions: string[]): Promise<void> {
    const config = vscode.workspace.getConfiguration('nodeModulesExtractor');
    await config.update('excludedProjects', newExclusions, vscode.ConfigurationTarget.Global);

    // 重新加载配置
    this.config = this.loadConfiguration();

    // 重新初始化工作区
    await this.initializeWorkspaces();
  }

  private async scanDirectory(
    dirPath: string,
    packages: PackageInfo[],
    currentDepth: number,
    progressCallback?: (current: number, total: number) => void,
    parentName?: string
  ): Promise<void> {
    // 已通过依赖关系递归处理，不再需要目录扫描
    // 此函数已废弃，保留是为了兼容性
  }

  public dispose(): void {
    this.disableMonitoring();
    this.statusBar.dispose();
  }
}
import { I18nConfig } from './I18nConfig';

export const en: I18nConfig = {
    // 通用
    extensionName: 'Node Modules URL Extractor',
    description: 'Real-time monitoring of node_modules changes and extracting URL information from package.json',
    
    // 状态栏
    statusBarMonitoring: 'Monitoring Dependencies',
    statusBarNotMonitoring: 'Dependency Monitor',
    statusBarTooltipOn: 'Click to stop node_modules monitoring',
    statusBarTooltipOff: 'Click to start node_modules monitoring',
    
    // 命令
    extractUrls: 'Extract All Dependency URLs',
    configure: 'Configure Extractor',
    toggleMonitoring: 'Toggle Monitoring',
    refresh: 'Refresh',
    manageExclusions: 'Manage Excluded Projects',
    changeLanguage: 'Change Language',
    
    // 视图
    dependencyTreeTitle: 'Dependency Documentation',
    welcomeMessage: 'Click the button below to extract dependency documentation, or wait for automatic monitoring to complete.',
    extractDocument: 'Extract Documentation',
    noDataMessage: 'No dependency data found',
    
    // 配置
    configurationTitle: 'Node Modules URL Extractor',
    maxDepth: 'Maximum traversal depth for node_modules',
    outputFileName: 'Output file name',
    outputFormat: 'Output format',
    autoMonitoring: 'Auto-monitor node_modules changes',
    extractOnStartup: 'Auto-extract dependencies on VSCode startup',
    initialDelay: 'Delay before extraction after startup (ms)',
    incrementalUpdate: 'Enable incremental updates, only extract changed packages',
    excludedProjects: 'List of excluded project paths, these projects will not be checked',
    autoDetectProjects: 'Auto-detect multi-workspace projects',
    includeFields: 'URL fields to extract',
    
    // 依赖类型
    dependencies: 'Dependencies',
    devDependencies: 'Development Dependencies',
    peerDependencies: 'Peer Dependencies',
    optionalDependencies: 'Optional Dependencies',

    // 依赖类型标签（带图标）
    dependenciesLabel: '📦 Dependencies (dependencies)',
    devDependenciesLabel: '🛠️ Development Dependencies (devDependencies)',
    peerDependenciesLabel: '🤝 Peer Dependencies (peerDependencies)',
    optionalDependenciesLabel: '⚡ Optional Dependencies (optionalDependencies)',
    
    // URL类型
    homepage: 'Homepage',
    repository: 'Repository',
    bugs: 'Bug Reports',
    documentation: 'Documentation',
    other: 'Other Links',
    website: 'Website',
    
    // 消息
    monitoringStarted: 'Started node_modules monitoring, watching {0} projects',
    monitoringStopped: 'Stopped node_modules monitoring',
    extractionCompleted: 'URL extraction completed, saved to {0}',
    noNodeModulesFound: 'No node_modules directory found',
    configurationUpdated: 'Configuration updated (maxDepth: {0}), re-extracting dependency information...',
    changesDetected: 'Detected package.json changes, re-extracting dependency information...',
    
    // 其他消息
    noWorkspaceFound: 'No open workspace',
    initializationFailed: 'Workspace initialization failed',
    addToExclusions: 'Removed "{0}" from exclusion list',
    addToExclusionsFailed: 'Failed to add to exclusion list',
    removeFromExclusions: 'Added "{0}" to exclusion list',
    
    // 语言切换相关
    languageChanged: 'Extension language changed to {0}',
    restartRequired: 'Recommend restarting VSCode to fully apply language changes',
    
    // 详情面板
    packageDetails: 'Dependency Details',
    dependencyPath: 'Dependency Path',
    version: 'Version',
    path: 'Installation Path',
    links: 'Related Links',
    author: 'Author',
    license: 'License',
    keywords: 'Keywords',
    noDependencies: 'No detailed information',
    
    // 错误消息
    errorInvalidUrl: 'Invalid URL',
    errorExtractionFailed: 'Extraction failed',
    
    // Tooltip消息
    clickToOpen: 'Click to open',
    
    // 统计信息
    totalDependencies: 'Total Dependencies',
    dependencyStatistics: 'Dependency Statistics',
    
    // 详情面板额外
    dependencyChain: 'Dependency Chain',
    noUrlInformation: 'No URL information available',
    unknown: 'Unknown',
    otherDependencies: 'Other Dependencies',
    
    // 树视图额外
    showPackageDetails: 'Show Package Details',
    linkInformation: 'Link Information',
    noDetailedInfo: 'No Detailed Information',
    allDependencies: 'All Dependencies',
    invalidUrl: 'Invalid URL',
    unsupportedProtocol: 'Unsupported URL protocol',
    urlFormatError: 'URL format error',
    clickUrl: 'Click URL',

    // 用户消息 - 文件变化检测
    packageJsonChanged: 'Detected package.json changes, re-extracting dependency information...',
    nodeModulesChanged: 'Detected node_modules changes, re-extracting URLs...',
    noProjectsAvailable: 'No checkable projects available in the current workspace',
    noWorkspaceOpen: 'No workspace is open',

    // 配置相关
    configurationInDevelopment: 'Configuration feature in development...',
    openSettings: 'Open Settings',

    // 增量更新
    packagesUpdated: 'Updated URL information for {0} packages',
    incrementalUpdateFailed: 'Incremental update failed: {0}',
    unknownError: 'Unknown error',

    // 排除管理
    currentExcludedProjects: '--- Currently Excluded Projects ---',
    selectExclusionManagement: 'Select projects to exclude or re-include',
    removedFromExclusions: 'Removed "{0}" from exclusion list',
    addedToExclusions: 'Added "{0}" to exclusion list',

    // Markdown生成器
    dependencyDocumentTitle: '📚 Node Modules Dependency Documentation',
    generationTime: '📅 Generation Time',
    scanDepth: '🔍 Scan Depth',
    totalPackages: '📦 Total Packages',
    packagesWithUrls: '🔗 Packages with URLs',
    statisticsSection: '📊 Statistics',
    metric: 'Metric',
    quantity: 'Quantity',
    packagesWithUrlsMetric: 'Packages with URLs',
    totalUrls: 'Total URLs',
    coverage: 'Coverage',
    tableOfContents: '📋 Table of Contents',
    completeDependencyList: '📦 Complete Dependency List',
    urlQuickIndex: '🔗 URL Quick Index',
    configurationSection: '⚙️ Configuration',
    configurationItem: 'Configuration Item',
    value: 'Value',
    traversalDepth: 'Traversal Depth',
    outputFormatConfig: 'Output Format',
    outputFileNameConfig: 'Output File Name',
    autoMonitoringConfig: 'Auto Monitoring',
    enabled: 'Enabled',
    disabled: 'Disabled',
    extractFields: 'Extract Fields',
    tipMessage: '💡 Tip',
    customConfigTip: 'You can customize extraction settings in VSCode Settings',
    language: 'Interface language'
};
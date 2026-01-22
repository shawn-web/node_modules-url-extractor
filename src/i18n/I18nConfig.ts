export interface I18nConfig {
    // 通用
    extensionName: string;
    description: string;
    
    // 状态栏
    statusBarMonitoring: string;
    statusBarNotMonitoring: string;
    statusBarTooltipOn: string;
    statusBarTooltipOff: string;
    
    // 命令
    extractUrls: string;
    configure: string;
    toggleMonitoring: string;
    refresh: string;
    manageExclusions: string;
    changeLanguage: string;
    
    // 视图
    dependencyTreeTitle: string;
    welcomeMessage: string;
    extractDocument: string;
    noDataMessage: string;
    
    // 配置
    configurationTitle: string;
    maxDepth: string;
    outputFileName: string;
    outputFormat: string;
    autoMonitoring: string;
    extractOnStartup: string;
    initialDelay: string;
    incrementalUpdate: string;
    excludedProjects: string;
    autoDetectProjects: string;
    includeFields: string;
    
    // 依赖类型
    dependencies: string;
    devDependencies: string;
    peerDependencies: string;
    optionalDependencies: string;

    // 依赖类型标签（带图标）
    dependenciesLabel: string;
    devDependenciesLabel: string;
    peerDependenciesLabel: string;
    optionalDependenciesLabel: string;
    
    // URL类型
    homepage: string;
    repository: string;
    bugs: string;
    documentation: string;
    other: string;
    website: string;
    
    // 消息
    monitoringStarted: string;
    monitoringStopped: string;
    extractionCompleted: string;
    noNodeModulesFound: string;
    configurationUpdated: string;
    changesDetected: string;
    noWorkspaceFound: string;
    initializationFailed: string;
    addToExclusions: string;
    addToExclusionsFailed: string;
    removeFromExclusions: string;
    languageChanged: string;
    restartRequired: string;
    
    // 详情面板
    packageDetails: string;
    dependencyPath: string;
    version: string;
    path: string;
    links: string;
    author: string;
    license: string;
    keywords: string;
    noDependencies: string;
    
    // 错误消息
    errorInvalidUrl: string;
    errorExtractionFailed: string;
    
    // Tooltip消息
    clickToOpen: string;
    
    // 统计信息
    totalDependencies: string;
    dependencyStatistics: string;
    
    // 详情面板额外
    dependencyChain: string;
    noUrlInformation: string;
    unknown: string;
    otherDependencies: string;
    
    // 树视图额外
    showPackageDetails: string;
    linkInformation: string;
    noDetailedInfo: string;
    allDependencies: string;
    invalidUrl: string;
    unsupportedProtocol: string;
    urlFormatError: string;
    clickUrl: string;

    // 用户消息 - 文件变化检测
    packageJsonChanged: string;
    nodeModulesChanged: string;
    noProjectsAvailable: string;
    noWorkspaceOpen: string;

    // 配置相关
    configurationInDevelopment: string;
    openSettings: string;

    // 增量更新
    packagesUpdated: string;
    incrementalUpdateFailed: string;
    unknownError: string;

    // 排除管理
    currentExcludedProjects: string;
    selectExclusionManagement: string;
    removedFromExclusions: string;
    addedToExclusions: string;

    // Markdown生成器
    dependencyDocumentTitle: string;
    generationTime: string;
    scanDepth: string;
    totalPackages: string;
    packagesWithUrls: string;
    statisticsSection: string;
    metric: string;
    quantity: string;
    packagesWithUrlsMetric: string;
    totalUrls: string;
    coverage: string;
    tableOfContents: string;
    completeDependencyList: string;
    urlQuickIndex: string;
    configurationSection: string;
    configurationItem: string;
    value: string;
    traversalDepth: string;
    outputFormatConfig: string;
    outputFileNameConfig: string;
    autoMonitoringConfig: string;
    enabled: string;
    disabled: string;
    extractFields: string;
    tipMessage: string;
    customConfigTip: string;
    language: string;
}
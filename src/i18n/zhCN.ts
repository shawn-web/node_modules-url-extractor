import { I18nConfig } from './I18nConfig';

export const zhCN: I18nConfig = {
    // 通用
    extensionName: 'Node Modules URL Extractor',
    description: '实时监测 node_modules 变化并提取 package.json 中的 URL 信息',
    
    // 状态栏
    statusBarMonitoring: '依赖监测中',
    statusBarNotMonitoring: '依赖监测',
    statusBarTooltipOn: '点击关闭 node_modules 监测',
    statusBarTooltipOff: '点击开启 node_modules 监测',
    
    // 命令
    extractUrls: '提取所有依赖 URL',
    configure: '配置提取器',
    toggleMonitoring: '开启/关闭监测',
    refresh: '刷新',
    manageExclusions: '管理排除项目',
    changeLanguage: '切换语言',
    
    // 视图
    dependencyTreeTitle: '依赖文档',
    welcomeMessage: '点击下方按钮提取依赖文档，或等待自动监测完成。',
    extractDocument: '提取文档',
    noDataMessage: '未找到依赖数据',
    
    // 配置
    configurationTitle: 'Node Modules URL Extractor',
    maxDepth: '遍历 node_modules 的最大深度',
    outputFileName: '输出文件名',
    outputFormat: '输出格式',
    autoMonitoring: '自动监测 node_modules 变化',
    extractOnStartup: 'VSCode 启动时自动提取依赖',
    initialDelay: '启动后延迟提取的时间（毫秒）',
    incrementalUpdate: '启用增量更新，只提取变更的依赖包',
    excludedProjects: '排除的项目路径列表，这些项目不会被检查',
    autoDetectProjects: '自动检测多工作区项目',
    includeFields: '要提取的 URL 字段',
    
    // 依赖类型
    dependencies: '生产依赖',
    devDependencies: '开发依赖',
    peerDependencies: '对等依赖',
    optionalDependencies: '可选依赖',

    // 依赖类型标签（带图标）
    dependenciesLabel: '📦 生产依赖 (dependencies)',
    devDependenciesLabel: '🛠️ 开发依赖 (devDependencies)',
    peerDependenciesLabel: '🤝 对等依赖 (peerDependencies)',
    optionalDependenciesLabel: '⚡ 可选依赖 (optionalDependencies)',
    
    // URL类型
    homepage: '主页',
    repository: '代码仓库',
    bugs: '问题反馈',
    documentation: '文档',
    other: '其他链接',
    website: '网站',
    
    // 消息
    monitoringStarted: '已开启 node_modules 监测，监控 {0} 个项目',
    monitoringStopped: '已关闭 node_modules 监测',
    extractionCompleted: 'URL 提取完成，已保存到 {0}',
    noNodeModulesFound: '未找到 node_modules 目录',
    configurationUpdated: '配置已更新 (maxDepth: {0})，正在重新提取依赖信息...',
    changesDetected: '检测到 package.json 变化，重新提取依赖信息...',
    
    // 其他消息
    noWorkspaceFound: '没有打开的工作区',
    initializationFailed: '初始化工作区失败',
    addToExclusions: '已将 "{0}" 从排除列表中移除',
    addToExclusionsFailed: '添加到排除列表失败',
    removeFromExclusions: '已将 "{0}" 添加到排除列表',
    
    // 语言切换相关
    languageChanged: '插件语言已更改为 {0}',
    restartRequired: '建议重启 VSCode 以完全应用语言更改',
    
    // 详情面板
    packageDetails: '依赖详情',
    dependencyPath: '依赖链路',
    version: '版本',
    path: '安装路径',
    links: '相关链接',
    author: '作者',
    license: '许可证',
    keywords: '关键词',
    noDependencies: '无详细信息',
    
    // 错误消息
    errorInvalidUrl: '无效的 URL',
    errorExtractionFailed: '提取失败',
    
    // Tooltip消息
    clickToOpen: '点击打开',
    
    // 统计信息
    totalDependencies: '依赖总数',
    dependencyStatistics: '依赖统计',
    
    // 详情面板额外
    dependencyChain: '依赖链路',
    noUrlInformation: '暂无URL信息',
    unknown: '未知',
    otherDependencies: '其他依赖',
    
    // 树视图额外
    showPackageDetails: '显示包详情',
    linkInformation: '链接信息',
    noDetailedInfo: '无详细信息',
    allDependencies: '所有依赖',
    invalidUrl: '无效的URL',
    unsupportedProtocol: '不支持的URL协议',
    urlFormatError: 'URL格式错误',
    clickUrl: '点击URL',

    // 用户消息 - 文件变化检测
    packageJsonChanged: '检测到package.json变化，重新提取依赖信息...',
    nodeModulesChanged: '检测到node_modules变化，正在重新提取URL...',
    noProjectsAvailable: '当前工作区中暂无可检查的项目',
    noWorkspaceOpen: '没有打开的工作区',

    // 配置相关
    configurationInDevelopment: '配置功能开发中...',
    openSettings: '打开设置',

    // 增量更新
    packagesUpdated: '已更新 {0} 个包的URL信息',
    incrementalUpdateFailed: '增量更新失败: {0}',
    unknownError: '未知错误',

    // 排除管理
    currentExcludedProjects: '--- 当前排除的项目 ---',
    selectExclusionManagement: '选择要排除或取消排除的项目',
    removedFromExclusions: '已将 "{0}" 从排除列表中移除',
    addedToExclusions: '已将 "{0}" 添加到排除列表',

    // Markdown生成器
    dependencyDocumentTitle: '📚 Node Modules 依赖文档',
    generationTime: '📅 生成时间',
    scanDepth: '🔍 扫描深度',
    totalPackages: '📦 总包数',
    packagesWithUrls: '🔗 包含URL',
    statisticsSection: '📊 统计信息',
    metric: '指标',
    quantity: '数量',
    packagesWithUrlsMetric: '包含URL的包',
    totalUrls: 'URL总数',
    coverage: '覆盖率',
    tableOfContents: '📋 目录',
    completeDependencyList: '📦 完整依赖列表',
    urlQuickIndex: '🔗 URL快速索引',
    configurationSection: '⚙️ 配置信息',
    configurationItem: '配置项',
    value: '值',
    traversalDepth: '遍历深度',
    outputFormatConfig: '输出格式',
    outputFileNameConfig: '输出文件名',
    autoMonitoringConfig: '自动监测',
    enabled: '开启',
    disabled: '关闭',
    extractFields: '提取字段',
    tipMessage: '💡 提示',
    customConfigTip: '您可以在 VSCode 设置中自定义提取配置',
    language: '界面语言'
};
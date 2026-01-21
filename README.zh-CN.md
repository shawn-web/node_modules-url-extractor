# Node Modules URL Extractor

一个功能强大的 VSCode 插件，用于实时监测 node_modules 的变化并提取 package.json 中的 URL 信息，生成结构化的依赖文档。

## 📋 目录

- [✨ 功能特性](#-功能特性)
- [🚀 安装与使用](#-安装与使用)
- [⚙️ 配置选项](#️-配置选项)
- [📋 命令列表](#-命令列表)
- [📄 输出示例](#-输出示例)
- [🎯 使用场景](#-使用场景)
- [🛠️ 开发贡献](#️-开发贡献)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)
- [🙏 致谢](#-致谢)

## ✨ 功能特性

- 🔍 **实时监测** - 自动监测 node_modules 目录变化，无需手动操作
- 📊 **深度遍历** - 可配置遍历深度（1-10层），深入分析依赖树
- 🔗 **智能URL提取** - 提取 homepage、repository、bugs、documentation 等字段
- 🌳 **完整依赖链路** - 显示完整的依赖路径，如：`has-flag (nodemon->supports-color)`
- 📝 **多格式输出** - 支持 Markdown 和 JSON 格式输出
- 🎨 **可视化界面** - 独立的活动栏面板查看依赖信息
- ⚙️ **灵活配置** - 支持多种自定义选项，满足不同需求
- 💾 **自动保存** - 结果自动保存到指定文件
- 🚀 **增量更新** - 智能检测变更，只更新变化的包，提高效率
- 🎯 **项目排除** - 支持排除特定项目检查
- 👁️ **状态监控** - 清晰的监测状态显示（开启/关闭图标）

## 🚀 安装与使用

### 安装方法

1. **通过 VSCode 扩展市场安装**
   - 打开 VSCode
   - 按 `Ctrl+Shift+X` 打开扩展面板
   - 搜索 "Node Modules URL Extractor"
   - 点击安装

2. **通过本地开发安装**
   ```bash
   git clone https://github.com/your-username/node_modules-url-extractor.git
   cd node_modules-url-extractor
   npm install
   npm run compile
   ```

### 使用方法

1. **自动监测模式**
   - 插件激活后会自动开始监测 node_modules 变化
   - 状态栏显示当前监测状态
   - 检测到变化时自动更新依赖文档

2. **手动提取模式**
   - 按 `Ctrl+Shift+P` 打开命令面板
   - 输入 "提取所有依赖URL" 或选择相关命令
   - 等待处理完成

3. **查看依赖信息**
   - 在左侧活动栏点击"依赖文档"图标
   - 浏览完整的依赖树结构
   - 点击包名查看详细信息
   - 点击URL链接直接访问

## ⚙️ 配置选项

在 VSCode 设置中搜索 "nodeModulesExtractor" 进行配置：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `maxDepth` | number | 3 | 遍历 node_modules 的最大深度 (1-10) |
| `outputFileName` | string | `dependency-urls.md` | 输出文件名 |
| `outputFormat` | enum | `markdown` | 输出格式 (markdown/json) |
| `autoMonitoring` | boolean | `true` | 自动监测 node_modules 变化 |
| `extractOnStartup` | boolean | `true` | VSCode 启动时自动提取依赖 |
| `initialDelay` | number | 3000 | 启动后延迟提取时间 (毫秒) |
| `incrementalUpdate` | boolean | `true` | 启用增量更新，只提取变更的依赖包 |
| `excludedProjects` | array | `[]` | 排除的项目路径列表 |
| `autoDetectProjects` | boolean | `true` | 自动检测多工作区项目 |
| `includeFields` | array | `["homepage","repository","bugs","documentation"]` | 要提取的 URL 字段 |

## 📋 命令列表

| 命令 ID | 说明 | 快捷方式 |
|---------|------|----------|
| `nodeModulesExtractor.extractUrls` | 提取所有依赖 URL | 命令面板 |
| `nodeModulesExtractor.configure` | 配置提取器设置 | 命令面板 |
| `nodeModulesExtractor.toggleMonitoring` | 开启/关闭监测 | 状态栏按钮 |
| `nodeModulesExtractor.refresh` | 刷新依赖信息 | 树视图按钮 |
| `nodeModulesExtractor.manageExclusions` | 管理排除项目列表 | 命令面板 |

## 📄 输出示例

### Markdown 格式示例

```markdown
# 📚 Node Modules 依赖文档

> 📅 生成时间: 2026/1/21 10:11:34  
> 🔍 扫描深度: 3层  
> 📦 总包数: 207  
> 🔗 包含URL: 207

---

## 📊 统计信息

| 指标 | 数量 |
|------|------|
| 总包数 | 207 |
| 包含URL的包 | 207 |
| 最大深度 | 2 |
| URL总数 | 491 |
| 覆盖率 | 100.0% |

---

## 📦 完整依赖列表

### 🛠️ 开发依赖 (devDependencies)

#### 📦 nodemon (v3.1.9)

**路径:** `d:\other\node\backend\node_modules\nodemon`

**相关链接:**
- 🏠 **主页**: [nodemon.io/](https://nodemon.io)
- 📁 **代码仓库**: [github.com/remy/nodemon](https://github.com/remy/nodemon)

**子依赖:**
- #### 📦 supports-color (nodemon) (v5.5.0)
  - #### 📦 has-flag (nodemon->supports-color) (v3.0.0)
```

### JSON 格式示例

```json
{
  "extractedAt": "2024-01-21T10:11:34.000Z",
  "configuration": {
    "maxDepth": 3,
    "outputFileName": "dependency-urls.md",
    "outputFormat": "markdown",
    "autoMonitoring": true,
    "includeFields": ["homepage", "repository", "bugs", "documentation"]
  },
  "statistics": {
    "totalPackages": 207,
    "packagesWithUrls": 207,
    "maxDepth": 2,
    "totalUrls": 491
  },
  "tree": {
    "dependencies": {},
    "devDependencies": {
      "nodemon": {
        "name": "nodemon",
        "version": "3.1.9",
        "path": "d:\\other\\node\\backend\\node_modules\\nodemon",
        "depth": 0,
        "dependencyType": "devDependencies",
        "urls": {
          "homepage": "https://nodemon.io",
          "repository": "https://github.com/remy/nodemon"
        },
        "dependencies": {
          "supports-color": {
            "name": "supports-color",
            "version": "5.5.0",
            "depth": 1,
            "dependencies": {
              "has-flag": {
                "name": "has-flag",
                "version": "3.0.0",
                "depth": 2
              }
            }
          }
        }
      }
    }
  }
}
```

## 🎯 使用场景

### 📚 项目文档整理
快速了解项目中所有依赖的官方文档，生成统一的技术文档

### 🔍 依赖安全审计
检查依赖包的官方地址和问题反馈渠道，识别潜在的安全风险

### 📊 技术栈分析
统计项目使用的技术栈和对应的官方资源，便于技术选型

### 🔄 依赖迁移
在项目迁移或重构时，快速获取所有依赖的官方信息和兼容性

### 📖 新人上手
帮助新团队成员快速了解项目依赖结构和相关文档

### 🏢 企业资产管理
生成完整的依赖清单，便于企业的软件资产管理

## 🛠️ 开发贡献

### 项目结构

```
├── src/
│   ├── extension.ts                 # 插件入口点
│   ├── NodeModulesExtractor.ts      # 主要提取逻辑
│   ├── PackageJsonParser.ts         # package.json 解析
│   ├── DependencyTree.ts            # 依赖树构建
│   ├── DependencyTreeProvider.ts     # VSCode 树视图提供者
│   ├── MarkdownGenerator.ts         # Markdown 文档生成
│   ├── DependencyDetailProvider.ts  # 详情面板提供者
│   └── IncrementalExtractor.ts     # 增量更新逻辑
├── resources/
│   ├── icon.svg                     # 活动栏图标
│   └── logo.svg                     # 插件图标
├── package.json                     # 插件配置
├── tsconfig.json                    # TypeScript 配置
├── README.md                        # 说明文档
└── README.zh-CN.md                  # 中文说明文档
```

### 开发环境搭建

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/node_modules-url-extractor.git
   cd node_modules-url-extractor
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **编译 TypeScript**
   ```bash
   npm run compile
   ```

4. **启动调试**
   - 在 VSCode 中打开此项目
   - 按 `F5` 启动调试窗口
   - 在新窗口中测试插件功能

### 开发建议

- 遵循现有的代码风格和命名规范
- 添加适当的注释和类型定义
- 确保新功能有相应的测试用例
- 提交前运行 `npm run compile` 确保代码无错误

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 报告问题

如果您发现了 bug 或有功能建议，请：

1. 在 [Issues](https://github.com/your-username/node_modules-url-extractor/issues) 页面搜索现有问题
2. 如果没有相关问题，请创建新的 Issue
3. 提供详细的问题描述、重现步骤和环境信息

### 提交代码

1. **Fork 仓库** 到您的 GitHub 账户
2. **创建特性分支**
   ```bash
   git checkout -b feature/您的功能名称
   ```
3. **开发并测试**
   - 实现您的功能
   - 确保代码通过编译
   - 测试新功能不影响现有功能

4. **提交更改**
   ```bash
   git commit -m 'feat: 添加新功能描述'
   ```
   - 使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范

5. **推送分支**
   ```bash
   git push origin feature/您的功能名称
   ```

6. **创建 Pull Request**
   - 提供清晰的 PR 描述
   - 说明解决的问题和实现的方法
   - 等待代码审查和合并

### 代码审查

- 保持代码简洁、易读
- 添加适当的注释
- 确保所有测试通过
- 遵循项目的代码规范

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 您可以自由使用、修改和分发此代码。

## 🙏 致谢

感谢以下项目和个人：

- **VSCode 团队** - 提供了优秀的插件 API 和开发工具
- **Node.js 社区** - 提供了强大的包管理生态系统
- **开源贡献者们** - 所有创建和维护 node 包的开发者
- **用户反馈** - 感谢所有提供宝贵建议和 bug 报告的用户

## 🔗 相关链接

- [VSCode 扩展市场链接](https://marketplace.visualstudio.com/items?itemName=your-publisher.node_modules-url-extractor)
- [GitHub 仓库](https://github.com/your-username/node_modules-url-extractor)
- [问题反馈](https://github.com/your-username/node_modules-url-extractor/issues)
- [更新日志](CHANGELOG.md)

---

*📝 此文档由 Node Modules URL Extractor 插件自动生成部分内容*

*💡 如果您觉得这个插件有用，请给我们一个 ⭐ Star！*
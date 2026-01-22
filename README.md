# Node Modules URL Extractor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VSCode](https://img.shields.io/badge/VSCode-1.74.0+-blue.svg)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.4-blue.svg)](https://www.typescriptlang.org/)

一个强大的 VSCode 扩展，用于实时监测 node_modules 变化并从 package.json 文件中提取 URL 信息，生成结构化的依赖文档。

A powerful VSCode extension for real-time monitoring of node_modules changes and extracting URL information from package.json files to generate structured dependency documentation.

## 📋 目录 / Table of Contents

- [✨ 功能特性](#-功能特性)
- [🚀 安装与使用](#-安装与使用)
- [⚙️ 配置选项](#️-配置选项)
- [📋 命令列表](#-命令列表)
- [📄 输出示例](#-输出示例)
- [🎯 使用场景](#-使用场景)
- [🔧 常见问题](#-常见问题)
- [🛠️ 开发指南](#️-开发指南)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)
- [🙏 致谢](#-致谢)

## ✨ 功能特性 / Features

### 核心功能 / Core Features

- 🔍 **实时监测** - 自动监测 node_modules 目录变化，无需手动触发
- 📊 **深度遍历** - 可配置遍历深度（1-10层），深入分析依赖关系
- 🔗 **智能提取** - 提取 homepage、repository、bugs、documentation 等多种 URL 字段
- 🌳 **完整路径** - 显示完整依赖链，如：`has-flag (nodemon->supports-color)`
- 📝 **多种格式** - 支持 Markdown 和 JSON 两种输出格式
- 🎨 **可视化界面** - 专用的活动栏面板，直观查看依赖信息
- ⚙️ **灵活配置** - 多种自定义选项，满足不同需求
- 💾 **自动保存** - 结果自动保存到指定文件
- 🚀 **增量更新** - 智能变更检测，仅更新变更的包，提高效率
- 🎯 **项目排除** - 支持排除特定项目，避免不必要的监测
- 👁️ **状态监控** - 清晰的监测状态显示（睁眼/闭眼图标）
- 🌍 **多语言支持** - 支持中文和英文界面切换

### 技术亮点 / Technical Highlights

- ⚡ **高性能** - 采用增量更新机制，大幅提升处理速度
- 🎯 **精准识别** - 智能识别不同类型的依赖（dependencies、devDependencies 等）
- 📊 **统计分析** - 自动生成依赖统计信息，包括覆盖率分析
- 🔍 **层级展示** - 清晰展示依赖层级关系，便于理解项目结构
- 💡 **用户友好** - 直观的树形视图，点击即可查看详细信息

## 🚀 安装与使用 / Installation & Usage

### 安装方法 / Installation Methods

#### 方法一：从 VSCode Marketplace 安装 / Install from VSCode Marketplace

1. 打开 VSCode / Open VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板 / Press `Ctrl+Shift+X` to open Extensions panel
3. 搜索 "Node Modules URL Extractor" / Search for "Node Modules URL Extractor"
4. 点击安装 / Click Install

#### 方法二：本地开发安装 / Install from Local Development

```bash
git clone https://github.com/shawn-web/node_modules-url-extractor.git
cd node_modules-url-extractor
npm install
npm run compile
```

### 使用方法 / Usage Methods

#### 1. 自动监测模式 / Automatic Monitoring Mode

扩展激活后会自动开始监测 node_modules 变化：
- 状态栏显示当前监测状态
- 检测到变化时自动更新依赖文档
- 无需手动操作，完全自动化

The extension automatically starts monitoring node_modules changes after activation:
- Status bar shows current monitoring status
- Dependency documentation is automatically updated when changes are detected
- No manual operation required, fully automated

#### 2. 手动提取模式 / Manual Extraction Mode

```bash
# 按 Ctrl+Shift+P 打开命令面板
# 输入 "Extract all dependency URLs" 或选择相关命令
# 等待处理完成

# Press Ctrl+Shift+P to open command palette
# Type "Extract all dependency URLs" or select relevant command
# Wait for processing to complete
```

#### 3. 查看依赖信息 / Viewing Dependency Information

```bash
# 点击活动栏中的 "依赖文档" 图标
# 浏览完整的依赖树结构
# 点击包名查看详细信息
# 点击 URL 链接直接访问

# Click "Dependency Documentation" icon in the activity bar
# Browse complete dependency tree structure
# Click package names to view detailed information
# Click URL links to visit them directly
```

#### 4. 切换语言 / Switch Language

```bash
# 按 Ctrl+Shift+P 打开命令面板
# 输入 "Change Language" 或 "切换语言"
# 选择 "简体中文" 或 "English"
# 语言立即生效，无需重启

# Press Ctrl+Shift+P to open command palette
# Type "Change Language" or "切换语言"
# Select "简体中文" or "English"
# Language takes effect immediately, no restart needed
```

## ⚙️ 配置选项 / Configuration Options

在 VSCode 设置中搜索 "nodeModulesExtractor" 进行配置：

Search for "nodeModulesExtractor" in VSCode settings to configure:

| 配置项 / Configuration | 类型 / Type | 默认值 / Default | 描述 / Description |
|------------------------|-------------|------------------|-------------------|
| `maxDepth` | number | 3 | 遍历 node_modules 的最大深度（1-10）<br>Maximum traversal depth for node_modules (1-10) |
| `outputFileName` | string | `dependency-urls.md` | 输出文件名 / Output file name |
| `outputFormat` | enum | `markdown` | 输出格式：markdown/json<br>Output format (markdown/json) |
| `autoMonitoring` | boolean | `true` | 自动监测 node_modules 变化<br>Auto-monitor node_modules changes |
| `extractOnStartup` | boolean | `true` | VSCode 启动时自动提取依赖<br>Auto-extract dependencies on VSCode startup |
| `initialDelay` | number | 3000 | 启动后延迟提取的时间（毫秒）<br>Delay before extraction after startup (ms) |
| `incrementalUpdate` | boolean | `true` | 启用增量更新，只提取变更的依赖包<br>Enable incremental updates, only extract changed packages |
| `excludedProjects` | array | `[]` | 排除的项目路径列表<br>List of excluded project paths |
| `autoDetectProjects` | boolean | `true` | 自动检测多工作区项目<br>Auto-detect multi-workspace projects |
| `includeFields` | array | `["homepage","repository","bugs","documentation"]` | 要提取的 URL 字段<br>URL fields to extract |
| `language` | enum | `zh-CN` | 界面语言：zh-CN/en<br>Interface language (zh-CN/en) |

## 📋 命令列表 / Command List

| 命令 ID / Command ID | 描述 / Description | 访问方式 / Access Method |
|---------------------|-------------------|-------------------------|
| `nodeModulesExtractor.extractUrls` | 提取所有依赖 URL / Extract all dependency URLs | 命令面板 / Command Palette |
| `nodeModulesExtractor.configure` | 配置提取器设置 / Configure extractor settings | 命令面板 / Command Palette |
| `nodeModulesExtractor.toggleMonitoring` | 开启/关闭监测 / Toggle monitoring on/off | 状态栏按钮 / Status Bar Button |
| `nodeModulesExtractor.refresh` | 刷新依赖信息 / Refresh dependency information | 树视图按钮 / Tree View Button |
| `nodeModulesExtractor.manageExclusions` | 管理排除项目列表 / Manage excluded projects list | 命令面板 / Command Palette |
| `nodeModulesExtractor.changeLanguage` | 切换语言 / Switch language | 命令面板 / Command Palette |

## 📄 输出示例 / Output Examples

### Markdown 格式示例 / Markdown Format Example

```markdown
# 📚 Node Modules 依赖文档

> 📅 生成时间：2026/1/21 10:11:34  
> 🔍 扫描深度：3 层  
> 📦 总包数：207  
> 🔗 包含 URL 的包数：207

---

## 📊 统计信息

| 指标 | 数量 |
|------|------|
| 总包数 | 207 |
| 包含 URL 的包数 | 207 |
| 最大深度 | 2 |
| URL 总数 | 491 |
| 覆盖率 | 100.0% |

---

## 📦 完整依赖列表

### 🛠️ Development Dependencies (devDependencies)

#### 📦 nodemon (v3.1.9)

**路径：** `d:\other\node\backend\node_modules\nodemon`

**相关链接：**
- 🏠 **主页**：[nodemon.io/](https://nodemon.io)
- 📁 **仓库**：[github.com/remy/nodemon](https://github.com/remy/nodemon)

**子依赖：**
- #### 📦 supports-color (nodemon) (v5.5.0)
  - #### 📦 has-flag (nodemon->supports-color) (v3.0.0)
```

### JSON 格式示例 / JSON Format Example

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

## 🎯 使用场景 / Use Cases

- 📚 **项目文档管理** - 快速了解所有依赖的官方文档
- 🔍 **依赖安全审计** - 检查官方地址和问题报告渠道
- 📊 **技术栈分析** - 统计项目使用的技术栈
- 🔄 **依赖迁移** - 迁移时快速访问所有依赖的官方信息
- 📖 **团队入职** - 帮助新团队成员了解项目依赖结构
- 🎓 **学习研究** - 研究开源项目的依赖关系和最佳实践
- 🔧 **版本升级** - 升级依赖前快速查看官方文档和变更日志
- 📋 **合规检查** - 检查依赖的许可证和合规性

## 🔧 常见问题 / FAQ

### Q1: 扩展无法正常工作怎么办？

**A:** 请按以下步骤排查：
1. 检查项目根目录是否有 `node_modules` 文件夹
2. 确认 `package.json` 文件存在且格式正确
3. 查看 VSCode 输出面板中的错误信息
4. 尝试重新加载窗口（`Ctrl+Shift+P` -> "Reload Window"）

### Q2: 如何只提取特定类型的依赖？

**A:** 在配置中修改 `includeFields` 选项，只选择需要的字段：
```json
{
  "includeFields": ["homepage", "repository"]
}
```

### Q3: 增量更新不生效怎么办？

**A:** 确保 `incrementalUpdate` 设置为 `true`，并且有足够的时间间隔让扩展检测到变化。

### Q4: 如何排除某些项目？

**A:** 使用 `manageExclusions` 命令或在设置中配置 `excludedProjects`：
```json
{
  "excludedProjects": ["/path/to/excluded/project"]
}
```

### Q5: 输出文件保存在哪里？

**A:** 默认保存在项目根目录下的 `dependency-urls.md` 文件中，可以通过 `outputFileName` 配置修改。

## 🛠️ 开发指南 / Development Guide

### 项目结构 / Project Structure

```
├── src/
│   ├── extension.ts                 # 扩展入口点 / Extension entry point
│   ├── NodeModulesExtractor.ts      # 主要提取逻辑 / Main extraction logic
│   ├── PackageJsonParser.ts         # package.json 解析 / package.json parsing
│   ├── DependencyTree.ts            # 依赖树构建 / Dependency tree construction
│   ├── DependencyTreeProvider.ts     # VSCode 树视图提供者 / VSCode tree view provider
│   ├── MarkdownGenerator.ts         # Markdown 文档生成 / Markdown documentation generation
│   ├── DependencyDetailProvider.ts  # 详情面板提供者 / Detail panel provider
│   ├── IncrementalExtractor.ts     # 增量更新逻辑 / Incremental update logic
│   └── i18n/                     # 国际化配置 / Internationalization
│       ├── I18n.ts                # I18n 类实现 / I18n class implementation
│       ├── I18nConfig.ts          # I18n 配置接口 / I18n configuration interface
│       ├── zhCN.ts                # 中文翻译 / Chinese translation
│       └── en.ts                 # 英文翻译 / English translation
├── resources/
│   ├── icon.svg                   # 活动栏图标 / Activity bar icon
│   ├── logo.svg                   # 扩展图标 / Extension icon
│   └── icon.png                  # 备用图标 / Backup icon
├── test-project/                  # 测试项目 / Test project
├── package.json                  # 扩展配置 / Extension configuration
├── package.nls.json             # 英文本地化 / English localization
├── package.nls.zh-cn.json       # 中文本地化 / Chinese localization
├── tsconfig.json                 # TypeScript 配置 / TypeScript configuration
├── README.md                     # 英文文档 / English documentation
└── README.zh-CN.md              # 中文文档 / Chinese documentation
```

### 构建项目 / Build Project

```bash
# 安装依赖 / Install dependencies
npm install

# 编译项目 / Compile project
npm run compile

# 监听模式 / Watch mode
npm run watch
```

### 调试扩展 / Debug Extension

1. 在 VSCode 中打开此项目 / Open this project in VSCode
2. 按 F5 启动调试窗口 / Press F5 to launch debug window
3. 在新窗口中测试扩展功能 / Test extension features in the new window
4. 查看输出面板中的日志信息 / Check logs in the output panel

### 打包扩展 / Package Extension

```bash
# 安装 vsce 工具 / Install vsce tool
npm install -g @vscode/vsce

# 打包为 .vsix 文件 / Package as .vsix file
vsce package

# 发布到市场 / Publish to marketplace
vsce publish
```

## 🤝 贡献指南 / Contributing

我们欢迎各种形式的贡献！

We welcome all forms of contributions!

### 贡献流程 / Contributing Process

1. Fork 本仓库 / Fork this repository
2. 创建功能分支 / Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. 提交更改 / Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. 推送到分支 / Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. 创建 Pull Request / Open a Pull Request

### 代码规范 / Code Style

- 遵循 TypeScript 最佳实践 / Follow TypeScript best practices
- 添加适当的注释和文档 / Add appropriate comments and documentation
- 确保代码通过编译和测试 / Ensure code compiles and passes tests
- 保持代码简洁和可读性 / Keep code clean and readable

## 📄 许可证 / License

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 致谢 / Acknowledgments

- VSCode 团队提供的优秀扩展 API / VSCode team for excellent extension API
- 所有开源 package.json 字段标准 / All open source package.json field standards
- 社区反馈和建议 / Community feedback and suggestions
- 所有贡献者的辛勤付出 / All contributors' hard work

## 📞 联系方式 / Contact

- **GitHub Issues**: [提交问题 / Report Issues](https://github.com/shawn-web/node_modules-url-extractor/issues)
- **GitHub Discussions**: [参与讨论 / Join Discussions](https://github.com/shawn-web/node_modules-url-extractor/discussions)

---

*📝 本文档由 Node Modules URL Extractor 扩展部分自动生成*

*This documentation is partially auto-generated by Node Modules URL Extractor extension*

*💡 如果您觉得这个扩展有用，请给我们一个 ⭐ Star！*

*💡 If you find this extension useful, please give us a ⭐ Star!*
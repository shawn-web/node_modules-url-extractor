# Node Modules URL Extractor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VSCode](https://img.shields.io/badge/VSCode-1.74.0+-blue.svg)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.4-blue.svg)](https://www.typescriptlang.org/)

一个功能强大的 VSCode 插件，用于实时监测 node_modules 的变化并提取 package.json 中的 URL 信息，生成结构化的依赖文档。

## 📋 目录

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

## ✨ 功能特性

### 核心功能

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
- 🌍 **多语言支持** - 支持中文和英文界面切换

### 技术亮点

- ⚡ **高性能** - 采用增量更新机制，大幅提升处理速度
- 🎯 **精准识别** - 智能识别不同类型的依赖（dependencies、devDependencies 等）
- 📊 **统计分析** - 自动生成依赖统计信息，包括覆盖率分析
- 🔍 **层级展示** - 清晰展示依赖层级关系，便于理解项目结构
- 💡 **用户友好** - 直观的树形视图，点击即可查看详细信息

## 🚀 安装与使用

### 安装方法

#### 方法一：从 VSCode Marketplace 安装

1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "Node Modules URL Extractor"
4. 点击安装

#### 方法二：本地开发安装

```bash
git clone https://github.com/shawn-web/node_modules-url-extractor.git
cd node_modules-url-extractor
npm install
npm run compile
```

### 使用方法

#### 1. 自动监测模式

扩展激活后会自动开始监测 node_modules 变化：
- 状态栏显示当前监测状态
- 检测到变化时自动更新依赖文档
- 无需手动操作，完全自动化

#### 2. 手动提取模式

```bash
# 按 Ctrl+Shift+P 打开命令面板
# 输入 "提取所有依赖URL" 或选择相关命令
# 等待处理完成
```

#### 3. 查看依赖信息

```bash
# 点击活动栏中的 "依赖文档" 图标
# 浏览完整的依赖树结构
# 点击包名查看详细信息
# 点击 URL 链接直接访问
```

#### 4. 切换语言

```bash
# 按 Ctrl+Shift+P 打开命令面板
# 输入 "切换语言"
# 选择 "简体中文" 或 "English"
# 语言立即生效，无需重启
```

## ⚙️ 配置选项

在 VSCode 设置中搜索 "nodeModulesExtractor" 进行配置：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `maxDepth` | number | 3 | 遍历 node_modules 的最大深度（1-10） |
| `outputFileName` | string | `dependency-urls.md` | 输出文件名 |
| `outputFormat` | enum | `markdown` | 输出格式（markdown/json） |
| `autoMonitoring` | boolean | `true` | 自动监测 node_modules 变化 |
| `extractOnStartup` | boolean | `true` | VSCode 启动时自动提取依赖 |
| `initialDelay` | number | 3000 | 启动后延迟提取时间（毫秒） |
| `incrementalUpdate` | boolean | `true` | 启用增量更新，只提取变更的依赖包 |
| `excludedProjects` | array | `[]` | 排除的项目路径列表 |
| `autoDetectProjects` | boolean | `true` | 自动检测多工作区项目 |
| `includeFields` | array | `["homepage","repository","bugs","documentation"]` | 要提取的 URL 字段 |
| `language` | enum | `zh-CN` | 界面语言（zh-CN/en） |

## 📋 命令列表

| 命令 ID | 说明 | 快捷方式 |
|---------|------|----------|
| `nodeModulesExtractor.extractUrls` | 提取所有依赖 URL | 命令面板 |
| `nodeModulesExtractor.configure` | 配置提取器设置 | 命令面板 |
| `nodeModulesExtractor.toggleMonitoring` | 开启/关闭监测 | 状态栏按钮 |
| `nodeModulesExtractor.refresh` | 刷新依赖信息 | 树视图按钮 |
| `nodeModulesExtractor.manageExclusions` | 管理排除项目列表 | 命令面板 |
| `nodeModulesExtractor.changeLanguage` | 切换语言 | 命令面板 |

## 📄 输出示例

### Markdown 格式示例

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

### 🛠️ 开发依赖 (devDependencies)

#### 📦 nodemon (v3.1.9)

**路径：** `d:\other\node\backend\node_modules\nodemon`

**相关链接：**
- 🏠 **主页**：[nodemon.io/](https://nodemon.io)
- 📁 **仓库**：[github.com/remy/nodemon](https://github.com/remy/nodemon)

**子依赖：**
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

- 📚 **项目文档管理** - 快速了解所有依赖的官方文档
- 🔍 **依赖安全审计** - 检查官方地址和问题报告渠道
- 📊 **技术栈分析** - 统计项目使用的技术栈
- 🔄 **依赖迁移** - 迁移时快速访问所有依赖的官方信息
- 📖 **团队入职** - 帮助新团队成员了解项目依赖结构
- 🎓 **学习研究** - 研究开源项目的依赖关系和最佳实践
- 🔧 **版本升级** - 升级依赖前快速查看官方文档和变更日志
- 📋 **合规检查** - 检查依赖的许可证和合规性

## 🔧 常见问题

### Q1: 扩展无法正常工作怎么办？

**A:** 请按以下步骤排查：
1. 检查项目根目录是否有 `node_modules` 文件夹
2. 确认 `package.json` 文件存在且格式正确
3. 查看 VSCode 输出面板中的错误信息
4. 尝试重新加载窗口（`Ctrl+Shift+P` -> "重新加载窗口"）

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

## 🛠️ 开发指南

### 项目结构

```
├── src/
│   ├── extension.ts                 # 扩展入口点
│   ├── NodeModulesExtractor.ts      # 主要提取逻辑
│   ├── PackageJsonParser.ts         # package.json 解析
│   ├── DependencyTree.ts            # 依赖树构建
│   ├── DependencyTreeProvider.ts     # VSCode 树视图提供者
│   ├── MarkdownGenerator.ts         # Markdown 文档生成
│   ├── DependencyDetailProvider.ts  # 详情面板提供者
│   ├── IncrementalExtractor.ts     # 增量更新逻辑
│   └── i18n/                     # 国际化配置
│       ├── I18n.ts                # I18n 类实现
│       ├── I18nConfig.ts          # I18n 配置接口
│       ├── zhCN.ts                # 中文翻译
│       └── en.ts                 # 英文翻译
├── resources/
│   ├── icon.svg                   # 活动栏图标
│   ├── logo.svg                   # 扩展图标
│   └── icon.png                  # 备用图标
├── test-project/                  # 测试项目
├── package.json                  # 扩展配置
├── package.nls.json             # 英文本地化
├── package.nls.zh-cn.json       # 中文本地化
├── tsconfig.json                 # TypeScript 配置
├── README.md                     # 英文文档
└── README.zh-CN.md              # 中文文档
```

### 构建项目

```bash
# 安装依赖
npm install

# 编译项目
npm run compile

# 监听模式
npm run watch
```

### 调试扩展

1. 在 VSCode 中打开此项目
2. 按 F5 启动调试窗口
3. 在新窗口中测试扩展功能
4. 查看输出面板中的日志信息

### 打包扩展

```bash
# 安装 vsce 工具
npm install -g @vscode/vsce

# 打包为 .vsix 文件
vsce package

# 发布到市场
vsce publish
```

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 贡献流程

1. Fork 本仓库
2. 创建功能分支
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. 提交更改
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. 推送到分支
   ```bash
   git push origin feature/AmazingFeature
   ```
5. 创建 Pull Request

### 代码规范

- 遵循 TypeScript 最佳实践
- 添加适当的注释和文档
- 确保代码通过编译和测试
- 保持代码简洁和可读性

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- VSCode 团队提供的优秀扩展 API
- 所有开源 package.json 字段标准
- 社区反馈和建议
- 所有贡献者的辛勤付出

## 📞 联系方式

- **GitHub Issues**: [提交问题](https://github.com/shawn-web/node_modules-url-extractor/issues)
- **GitHub Discussions**: [参与讨论](https://github.com/shawn-web/node_modules-url-extractor/discussions)

---

*📝 本文档由 Node Modules URL Extractor 扩展部分自动生成*

*💡 如果您觉得这个扩展有用，请给我们一个 ⭐ Star！*
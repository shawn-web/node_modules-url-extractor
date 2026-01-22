# Node Modules URL Extractor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VSCode](https://img.shields.io/badge/VSCode-1.74.0+-blue.svg)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.4-blue.svg)](https://www.typescriptlang.org/)

A powerful VSCode extension for real-time monitoring of node_modules changes and extracting URL information from package.json files to generate structured dependency documentation.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Installation & Usage](#-installation--usage)
- [⚙️ Configuration Options](#️-configuration-options)
- [📋 Command List](#-command-list)
- [📄 Output Examples](#-output-examples)
- [🎯 Use Cases](#-use-cases)
- [🔧 FAQ](#-faq)
- [🛠️ Development Guide](#️-development-guide)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

### Core Features

- 🔍 **Real-time Monitoring** - Automatically monitors node_modules directory changes
- 📊 **Deep Traversal** - Configurable traversal depth (1-10 levels) for deep dependency analysis
- 🔗 **Smart URL Extraction** - Extracts homepage, repository, bugs, documentation and other fields
- 🌳 **Complete Dependency Paths** - Shows full dependency chains like: `has-flag (nodemon->supports-color)`
- 📝 **Multiple Output Formats** - Supports both Markdown and JSON output formats
- 🎨 **Visual Interface** - Dedicated activity bar panel for viewing dependency information
- ⚙️ **Flexible Configuration** - Multiple customizable options to meet different needs
- 💾 **Auto-save** - Results automatically saved to specified files
- 🚀 **Incremental Updates** - Smart change detection, only updates changed packages for efficiency
- 🎯 **Project Exclusion** - Support for excluding specific projects from monitoring
- 👁️ **Status Monitoring** - Clear monitoring status display (open/closed eye icons)
- 🌍 **Multi-language Support** - Supports Chinese and English interface switching

### Technical Highlights

- ⚡ **High Performance** - Uses incremental update mechanism to significantly improve processing speed
- 🎯 **Precise Recognition** - Intelligently identifies different dependency types (dependencies, devDependencies, etc.)
- 📊 **Statistical Analysis** - Automatically generates dependency statistics including coverage analysis
- 🔍 **Hierarchical Display** - Clearly displays dependency hierarchy for better understanding of project structure
- 💡 **User-friendly** - Intuitive tree view, click to view detailed information

## 🚀 Installation & Usage

### Installation Methods

#### Method 1: Install from VSCode Marketplace

1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions panel
3. Search for "Node Modules URL Extractor"
4. Click Install

#### Method 2: Install from Local Development

```bash
git clone https://github.com/shawn-web/node_modules-url-extractor.git
cd node_modules-url-extractor
npm install
npm run compile
```

### Usage Methods

#### 1. Automatic Monitoring Mode

The extension automatically starts monitoring node_modules changes after activation:
- Status bar shows current monitoring status
- Dependency documentation is automatically updated when changes are detected
- No manual operation required, fully automated

#### 2. Manual Extraction Mode

```bash
# Press Ctrl+Shift+P to open command palette
# Type "Extract all dependency URLs" or select relevant command
# Wait for processing to complete
```

#### 3. Viewing Dependency Information

```bash
# Click "Dependency Documentation" icon in activity bar
# Browse complete dependency tree structure
# Click package names to view detailed information
# Click URL links to visit them directly
```

#### 4. Switch Language

```bash
# Press Ctrl+Shift+P to open command palette
# Type "Change Language"
# Select "简体中文" or "English"
# Language takes effect immediately, no restart needed
```

## ⚙️ Configuration Options

Search for "nodeModulesExtractor" in VSCode settings to configure:

| Configuration | Type | Default | Description |
|-------------|------|---------|-------------|
| `maxDepth` | number | 3 | Maximum traversal depth for node_modules (1-10) |
| `outputFileName` | string | `dependency-urls.md` | Output file name |
| `outputFormat` | enum | `markdown` | Output format (markdown/json) |
| `autoMonitoring` | boolean | `true` | Auto-monitor node_modules changes |
| `extractOnStartup` | boolean | `true` | Auto-extract dependencies on VSCode startup |
| `initialDelay` | number | 3000 | Delay before extraction after startup (ms) |
| `incrementalUpdate` | boolean | `true` | Enable incremental updates, only extract changed packages |
| `excludedProjects` | array | `[]` | List of excluded project paths |
| `autoDetectProjects` | boolean | `true` | Auto-detect multi-workspace projects |
| `includeFields` | array | `["homepage","repository","bugs","documentation"]` | URL fields to extract |
| `language` | enum | `zh-CN` | Interface language (zh-CN/en) |

## 📋 Command List

| Command ID | Description | Access Method |
|-----------|-------------|----------------|
| `nodeModulesExtractor.extractUrls` | Extract all dependency URLs | Command Palette |
| `nodeModulesExtractor.configure` | Configure extractor settings | Command Palette |
| `nodeModulesExtractor.toggleMonitoring` | Toggle monitoring on/off | Status Bar Button |
| `nodeModulesExtractor.refresh` | Refresh dependency information | Tree View Button |
| `nodeModulesExtractor.manageExclusions` | Manage excluded projects list | Command Palette |
| `nodeModulesExtractor.changeLanguage` | Switch language | Command Palette |

## 📄 Output Examples

### Markdown Format Example

```markdown
# 📚 Node Modules Dependency Documentation

> 📅 Generated: 2026/1/21 10:11:34
> 🔍 Scan Depth: 3 levels
> 📦 Total Packages: 207
> 🔗 Packages with URLs: 207

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Packages | 207 |
| Packages with URLs | 207 |
| Max Depth | 2 |
| Total URLs | 491 |
| Coverage | 100.0% |

---

## 📦 Complete Dependency List

### 🛠️ Development Dependencies (devDependencies)

#### 📦 nodemon (v3.1.9)

**Path:** `d:\other\node\backend\node_modules\nodemon`

**Related Links:**
- 🏠 **Homepage**: [nodemon.io/](https://nodemon.io)
- 📁 **Repository**: [github.com/remy/nodemon](https://github.com/remy/nodemon)

**Sub-dependencies:**
- #### 📦 supports-color (nodemon) (v5.5.0)
  - #### 📦 has-flag (nodemon->supports-color) (v3.0.0)
```

### JSON Format Example

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

## 🎯 Use Cases

- 📚 **Project Documentation Management** - Quickly understand all dependencies' official documentation
- 🔍 **Dependency Security Auditing** - Check official addresses and issue reporting channels
- 📊 **Technology Stack Analysis** - Statistics on technology stacks used in project
- 🔄 **Dependency Migration** - Quick access to all dependencies' official info during migration
- 📖 **Team Onboarding** - Help new team members understand project dependency structure
- 🎓 **Learning and Research** - Study open source projects' dependency relationships and best practices
- 🔧 **Version Upgrades** - Quickly view official docs and changelogs before upgrading dependencies
- 📋 **Compliance Checking** - Check dependency licenses and compliance

## 🔧 FAQ

### Q1: What to do if the extension doesn't work properly?

**A:** Please follow these troubleshooting steps:
1. Check if there's a `node_modules` folder in the project root
2. Confirm `package.json` file exists and is properly formatted
3. Check error messages in VSCode output panel
4. Try reloading the window (`Ctrl+Shift+P` -> "Reload Window")

### Q2: How to extract only specific types of dependencies?

**A:** Modify the `includeFields` option in settings to select only needed fields:
```json
{
  "includeFields": ["homepage", "repository"]
}
```

### Q3: What to do if incremental updates don't work?

**A:** Ensure `incrementalUpdate` is set to `true`, and allow sufficient time for the extension to detect changes.

### Q4: How to exclude certain projects?

**A:** Use the `manageExclusions` command or configure `excludedProjects` in settings:
```json
{
  "excludedProjects": ["/path/to/excluded/project"]
}
```

### Q5: Where is the output file saved?

**A:** By default, it's saved in the project root as `dependency-urls.md`, which can be modified via `outputFileName` configuration.

## 🛠️ Development Guide

### Project Structure

```
├── src/
│   ├── extension.ts                 # Extension entry point
│   ├── NodeModulesExtractor.ts      # Main extraction logic
│   ├── PackageJsonParser.ts         # package.json parsing
│   ├── DependencyTree.ts            # Dependency tree construction
│   ├── DependencyTreeProvider.ts     # VSCode tree view provider
│   ├── MarkdownGenerator.ts         # Markdown documentation generation
│   ├── DependencyDetailProvider.ts  # Detail panel provider
│   ├── IncrementalExtractor.ts     # Incremental update logic
│   └── i18n/                     # Internationalization
│       ├── I18n.ts                # I18n class implementation
│       ├── I18nConfig.ts          # I18n configuration interface
│       ├── zhCN.ts                # Chinese translation
│       └── en.ts                 # English translation
├── resources/
│   ├── icon.svg                   # Activity bar icon
│   ├── logo.svg                   # Extension icon
│   └── icon.png                  # Backup icon
├── test-project/                  # Test project
├── package.json                  # Extension configuration
├── package.nls.json             # English localization
├── package.nls.zh-cn.json       # Chinese localization
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # English documentation
└── README.zh-CN.md              # Chinese documentation
```

### Build Project

```bash
# Install dependencies
npm install

# Compile project
npm run compile

# Watch mode
npm run watch
```

### Debug Extension

1. Open this project in VSCode
2. Press F5 to launch debug window
3. Test extension features in new window
4. Check logs in output panel

### Package Extension

```bash
# Install vsce tool
npm install -g @vscode/vsce

# Package as .vsix file
vsce package

# Publish to marketplace
vsce publish
```

## 🤝 Contributing

We welcome all forms of contributions!

### Contributing Process

1. Fork this repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Add appropriate comments and documentation
- Ensure code compiles and passes tests
- Keep code clean and readable

## 📄 License

This project is licensed under MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- VSCode team for excellent extension API
- All open source package.json field standards
- Community feedback and suggestions
- All contributors' hard work

## 📞 Contact

- **GitHub Issues**: [Report Issues](https://github.com/shawn-web/node_modules-url-extractor/issues)
- **GitHub Discussions**: [Join Discussions](https://github.com/shawn-web/node_modules-url-extractor/discussions)

---

*📝 This documentation is partially auto-generated by Node Modules URL Extractor extension*

*💡 If you find this extension useful, please give us a ⭐ Star!*
# Node Modules URL Extractor

A powerful VSCode extension for real-time monitoring of node_modules changes and extracting URL information from package.json files to generate structured dependency documentation.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Installation & Usage](#-installation--usage)
- [⚙️ Configuration Options](#️-configuration-options)
- [📋 Command List](#-command-list)
- [📄 Output Examples](#-output-examples)
- [🎯 Use Cases](#-use-cases)
- [🛠️ Development](#️-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

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

## 🚀 Installation & Usage

### Installation Methods

1. **Install from VSCode Marketplace**
   - Open VSCode
   - Press `Ctrl+Shift+X` to open the Extensions panel
   - Search for "Node Modules URL Extractor"
   - Click Install

2. **Install from Local Development**
   ```bash
   git clone https://github.com/your-username/node_modules-url-extractor.git
   cd node_modules-url-extractor
   npm install
   npm run compile
   ```

### Usage Methods

1. **Automatic Monitoring Mode**
   - The extension automatically starts monitoring node_modules changes after activation
   - Status bar shows current monitoring status
   - Dependency documentation is automatically updated when changes are detected

2. **Manual Extraction Mode**
   - Press `Ctrl+Shift+P` to open the command palette
   - Type "Extract all dependency URLs" or select the relevant command
   - Wait for processing to complete

3. **Viewing Dependency Information**
   - Click the "Dependency Documentation" icon in the activity bar
   - Browse the complete dependency tree structure
   - Click package names to view detailed information
   - Click URL links to visit them directly

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

## 📋 Command List

| Command ID | Description | Access Method |
|-----------|-------------|----------------|
| `nodeModulesExtractor.extractUrls` | Extract all dependency URLs | Command Palette |
| `nodeModulesExtractor.configure` | Configure extractor settings | Command Palette |
| `nodeModulesExtractor.toggleMonitoring` | Toggle monitoring on/off | Status Bar Button |
| `nodeModulesExtractor.refresh` | Refresh dependency information | Tree View Button |
| `nodeModulesExtractor.manageExclusions` | Manage excluded projects list | Command Palette |

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

### 📚 Project Documentation Management
Quickly understand all dependencies' official documentation and generate unified technical documentation

### 🔍 Dependency Security Auditing
Check official addresses and issue reporting channels for dependency packages to identify potential security risks

### 📊 Technology Stack Analysis
Statistics on technology stacks used in the project and corresponding official resources for technology selection

### 🔄 Dependency Migration
Quickly get all dependency official information and compatibility during project migration or refactoring

### 📖 Team Onboarding
Help new team members quickly understand project dependency structure and related documentation

### 🏢 Enterprise Asset Management
Generate complete dependency inventories for enterprise software asset management

## 🛠️ Development

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
│   └── IncrementalExtractor.ts     # Incremental update logic
├── resources/
│   ├── icon.svg                     # Activity bar icon
│   └── logo.svg                     # Extension icon
├── package.json                     # Extension configuration
├── tsconfig.json                    # TypeScript configuration
├── README.md                        # English documentation
└── README.zh-CN.md                  # Chinese documentation
```

### Development Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/node_modules-url-extractor.git
   cd node_modules-url-extractor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Start Debugging**
   - Open this project in VSCode
   - Press `F5` to launch debug window
   - Test extension features in the new window

### Development Guidelines

- Follow existing code style and naming conventions
- Add appropriate comments and type definitions
- Ensure new features have corresponding test cases
- Run `npm run compile` before committing to ensure error-free code

## 🤝 Contributing

We welcome all forms of contributions!

### Reporting Issues

If you find a bug or have feature suggestions, please:

1. Search existing issues on the [Issues](https://github.com/your-username/node_modules-url-extractor/issues) page
2. If no related issue exists, create a new Issue
3. Provide detailed problem description, reproduction steps, and environment information

### Submitting Code

1. **Fork Repository** to your GitHub account
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Develop and Test**
   - Implement your feature
   - Ensure code compiles without errors
   - Test new functionality doesn't affect existing features

4. **Commit Changes**
   ```bash
   git commit -m 'feat: add new feature description'
   ```
   - Follow [Conventional Commits](https://www.conventionalcommits.org/) specification

5. **Push Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear PR description
   - Explain problems solved and implementation methods
   - Wait for code review and merge

### Code Review

- Keep code clean and readable
- Add appropriate comments
- Ensure all tests pass
- Follow project coding standards

## 📄 License

This project is licensed under the [MIT License](LICENSE) - you are free to use, modify, and distribute this code.

## 🙏 Acknowledgments

Thanks to the following projects and individuals:

- **VSCode Team** - For providing excellent extension API and development tools
- **Node.js Community** - For providing a powerful package management ecosystem
- **Open Source Contributors** - All developers who create and maintain node packages
- **User Feedback** - Thanks to all users who provide valuable suggestions and bug reports

## 🔗 Related Links

- [VSCode Marketplace Link](https://marketplace.visualstudio.com/items?itemName=your-publisher.node-modules-url-extractor)
- [GitHub Repository](https://github.com/your-username/node_modules-url-extractor)
- [Issue Tracker](https://github.com/your-username/node_modules-url-extractor/issues)
- [Changelog](CHANGELOG.md)

---

*📝 This documentation is partially auto-generated by the Node Modules URL Extractor extension*

*💡 If you find this extension useful, please give us a ⭐ Star!*
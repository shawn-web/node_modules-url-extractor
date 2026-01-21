import { PackageInfo, ExtractorConfig } from './NodeModulesExtractor';
import { DependencyTree } from './DependencyTree';

export class MarkdownGenerator {
  constructor(private config: ExtractorConfig, private dependencyTree?: DependencyTree) { }

  public generateMarkdown(tree: any): string {
    const stats = tree.statistics;
    let markdown = '';

    // 标题和概述
    markdown += this.generateHeader(stats);

    // 统计信息
    markdown += this.generateStatistics(stats);

    // 目录
    markdown += this.generateTableOfContents();

    // 依赖列表
    markdown += this.generateDependencyList(tree);

    // 配置信息
    markdown += this.generateConfiguration();

    // 页脚
    markdown += this.generateFooter();

    return markdown;
  }

  private generateHeader(stats: any): string {
    const date = new Date().toLocaleString('zh-CN');
    return `# 📚 Node Modules 依赖文档

> 📅 生成时间: ${date}  
> 🔍 扫描深度: ${this.config.maxDepth}层  
> 📦 总包数: ${stats.totalPackages}  
> 🔗 包含URL: ${stats.packagesWithUrls}

---

`;
  }

  private generateStatistics(stats: any): string {
    return `## 📊 统计信息

| 指标 | 数量 |
|------|------|
| 总包数 | ${stats.totalPackages} |
| 包含URL的包 | ${stats.packagesWithUrls} |
| 最大深度 | ${stats.maxDepth} |
| URL总数 | ${stats.totalUrls} |
| 覆盖率 | ${((stats.packagesWithUrls / stats.totalPackages) * 100).toFixed(1)}% |

---

`;
  }

  private generateTableOfContents(): string {
    return `## 📋 目录

- [📊 统计信息](#-统计信息)
- [📦 完整依赖列表](#-完整依赖列表)
- [🔗 URL快速索引](#-url快速索引)
- [⚙️ 配置信息](#️-配置信息)

---

`;
  }

  private generateDependencyList(tree: any): string {
    let markdown = `## 📦 完整依赖列表\n\n`;
    markdown += this.generateDependencyTree(tree);

    // 按URL类型分组（作为可选的分类）
    const urlGroups = this.groupUrlsByType(tree);

    const hasUrls = Object.values(urlGroups).some((urls: any) => urls.length > 0);

    if (hasUrls) {
      markdown += `---\n\n`;
      markdown += `## 🔗 URL快速索引\n\n`;

      for (const [type, urls] of Object.entries(urlGroups)) {
        if (urls.length > 0) {
          markdown += `### ${this.getUrlTypeIcon(type)} ${this.getUrlTypeName(type)}\n\n`;

          urls.forEach((item: any) => {
            const name = item.packageName;
            const version = item.version;
            const url = item.url;

            markdown += `- **[${name}](#${name.toLowerCase().replace(/[^a-z0-9]/g, '')})** (v${version}) - [🔗 直接访问](${url})\n`;
          });
          markdown += '\n';
        }
      }
    }

    return markdown;
  }

  private generateDependencyTree(tree: any, depth: number = 0): string {
    let result = '';

    // 处理新的树结构：按依赖类型分组，显示层级关系
    const depTypes = [
      { key: 'dependencies', name: '生产依赖 (dependencies)', icon: '📦' },
      { key: 'devDependencies', name: '开发依赖 (devDependencies)', icon: '🛠️' },
      { key: 'peerDependencies', name: '对等依赖 (peerDependencies)', icon: '🤝' },
      { key: 'optionalDependencies', name: '可选依赖 (optionalDependencies)', icon: '⚡' }
    ];

    for (const depType of depTypes) {
      const deps = tree[depType.key];
      if (deps && typeof deps === 'object' && Object.keys(deps).length > 0) {
        result += `### ${depType.icon} ${depType.name}\n\n`;

        for (const [name, dep] of Object.entries(deps)) {
          result += this.generateDependencyTreeNodeWithHierarchy(dep as any, name, 1);
        }
        result += '\n';
      }
    }

    return result;
  }

  private generateDependencyTreeNodeWithHierarchy(node: any, name: string, depth: number): string {
    const indent = '  '.repeat(depth);
    let result = '';

    // 获取完整依赖链路
    let dependencyPath = '';
    if (this.dependencyTree) {
      const path = this.dependencyTree.getDependencyPath(name);
      if (path.length > 1) {
        dependencyPath = ` (${path.slice(0, -1).join('->')})`;
      }
    }

    // 包信息
    const version = node.version || 'unknown';
    result += `${indent}#### 📦 ${name}${dependencyPath} (v${version})\n\n`;

    if (node.path) {
      result += `${indent}**路径:** \`${node.path}\`\n\n`;
    }

    // URL信息
    if (node.urls && typeof node.urls === 'object' && Object.keys(node.urls).length > 0) {
      result += `${indent}**相关链接:**\n\n`;

      for (const [type, url] of Object.entries(node.urls)) {
        if (url) {
          const urlStr = String(url);
          result += `${indent}- ${this.getUrlTypeIcon(type)} **${this.getUrlTypeName(type)}**: [${this.formatUrl(urlStr)}](${urlStr})\n`;
        }
      }
      result += '\n';
    }

    // 处理子依赖
    const hasDeps = node.dependencies && typeof node.dependencies === 'object' && Object.keys(node.dependencies).length > 0;

    if (hasDeps) {
      result += `${indent}**子依赖:**\n\n`;
      for (const [childName, childDep] of Object.entries(node.dependencies)) {
        const childContent = this.generateDependencyTreeNodeWithHierarchy(childDep as any, childName, depth + 1);
        const lines = childContent.split('\n');
        if (lines.length > 0) {
          // 第一行：标题转换为列表项
          const firstLine = lines[0].replace(/^  +/, ''); // 移除开头的空格
          result += `${indent}- ${firstLine}\n`;

          // 其余行：直接追加，保持原有的缩进
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim()) {
              result += `${line}\n`;
            } else {
              result += '\n';
            }
          }
        }
      }
    } else {
      // 只有叶子节点（真正没有依赖的包）才显示"无子依赖"
      result += `${indent}*无子依赖*\n\n`;
    }

    result += '\n';
    return result;
  }

  private groupUrlsByType(tree: any): { [key: string]: any[] } {
    const groups: { [key: string]: any[] } = {
      homepage: [],
      repository: [],
      bugs: [],
      documentation: [],
      other: []
    };

    const collectUrls = (node: any) => {
      if (!node) return;

      // 处理新的树结构
      if (node.urls && typeof node.urls === 'object') {
        // 这是一个包节点
        for (const [type, url] of Object.entries(node.urls)) {
          if (url) {
            const targetGroup = groups[type] || groups.other;
            targetGroup.push({
              packageName: node.name,
              version: node.version,
              path: node.path,
              depth: node.depth,
              url: url
            });
          }
        }
      }

      // 如果有dependencies，递归处理
      if (node.dependencies && typeof node.dependencies === 'object') {
        Object.values(node.dependencies).forEach((dep: any) => collectUrls(dep));
      }
    };

    // 处理新的树结构
    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
    for (const depType of depTypes) {
      if (tree[depType] && typeof tree[depType] === 'object') {
        Object.values(tree[depType]).forEach((dep: any) => collectUrls(dep));
      }
    }

    return groups;
  }

  private getUrlTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      homepage: '🏠',
      repository: '📁',
      bugs: '🐛',
      documentation: '📚',
      other: '🔗'
    };
    return icons[type] || icons.other;
  }

  private getUrlTypeName(type: string): string {
    const names: { [key: string]: string } = {
      homepage: '主页',
      repository: '代码仓库',
      bugs: '问题反馈',
      documentation: '文档',
      other: '其他链接'
    };
    return names[type] || names.other;
  }

  private formatUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
  }

  private generateConfiguration(): string {
    return `## ⚙️ 配置信息

| 配置项 | 值 |
|--------|-----|
| 遍历深度 | ${this.config.maxDepth} |
| 输出格式 | ${this.config.outputFormat} |
| 输出文件名 | ${this.config.outputFileName} |
| 自动监测 | ${this.config.autoMonitoring ? '开启' : '关闭'} |
| 提取字段 | ${this.config.includeFields.join(', ')} |

---

`;
  }

  private generateFooter(): string {
    return `---

*💡 提示: 您可以在 VSCode 设置中自定义提取配置*`;
  }
}
import { PackageInfo, ExtractorConfig } from './NodeModulesExtractor';
import { DependencyTree } from './DependencyTree';
import { I18n } from './i18n/I18n';

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
    const locale = I18n.getCurrentLocale();
    const date = new Date().toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US');
    return `# ${I18n.t('dependencyDocumentTitle')}

> ${I18n.t('generationTime')}: ${date}
> ${I18n.t('scanDepth')}: ${this.config.maxDepth}${I18n.getCurrentLocale() === 'zh-CN' ? '层' : ' levels'}
> ${I18n.t('totalPackages')}: ${stats.totalPackages}
> ${I18n.t('packagesWithUrls')}: ${stats.packagesWithUrls}

---
`;
  }

  private generateStatistics(stats: any): string {
    return `## ${I18n.t('statisticsSection')}

| ${I18n.t('metric')} | ${I18n.t('quantity')} |
|------|------|
| ${I18n.t('totalPackages')} | ${stats.totalPackages} |
| ${I18n.t('packagesWithUrlsMetric')} | ${stats.packagesWithUrls} |
| ${I18n.t('maxDepth')} | ${stats.maxDepth} |
| ${I18n.t('totalUrls')} | ${stats.totalUrls} |
| ${I18n.t('coverage')} | ${((stats.packagesWithUrls / stats.totalPackages) * 100).toFixed(1)}% |

---

`;
  }

  private generateTableOfContents(): string {
    return `## ${I18n.t('tableOfContents')}

- [${I18n.t('statisticsSection')}](#${I18n.t('statisticsSection').toLowerCase().replace(/[^a-z0-9]/g, '')})
- [${I18n.t('completeDependencyList')}](#${I18n.t('completeDependencyList').toLowerCase().replace(/[^a-z0-9]/g, '')})
- [${I18n.t('urlQuickIndex')}](#${I18n.t('urlQuickIndex').toLowerCase().replace(/[^a-z0-9]/g, '')})
- [${I18n.t('configurationSection')}](#${I18n.t('configurationSection').toLowerCase().replace(/[^a-z0-9]/g, '')})

---

`;
  }

  private generateDependencyList(tree: any): string {
    let markdown = `## ${I18n.t('completeDependencyList')}\n\n`;
    markdown += this.generateDependencyTree(tree);

    // 按URL类型分组（作为可选的分类）
    const urlGroups = this.groupUrlsByType(tree);

    const hasUrls = Object.values(urlGroups).some((urls: any) => urls.length > 0);

    if (hasUrls) {
      markdown += `---\n\n`;
      markdown += `## ${I18n.t('urlQuickIndex')}\n\n`;

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
      { key: 'dependencies', name: I18n.t('dependenciesLabel') },
      { key: 'devDependencies', name: I18n.t('devDependenciesLabel') },
      { key: 'peerDependencies', name: I18n.t('peerDependenciesLabel') },
      { key: 'optionalDependencies', name: I18n.t('optionalDependenciesLabel') }
    ];

    for (const depType of depTypes) {
      const deps = tree[depType.key];
      if (deps && typeof deps === 'object' && Object.keys(deps).length > 0) {
        result += `### ${depType.name}\n\n`;

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
      homepage: I18n.t('homepage'),
      repository: I18n.t('repository'),
      bugs: I18n.t('bugs'),
      documentation: I18n.t('documentation'),
      other: I18n.t('other')
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
    return `## ${I18n.t('configurationSection')}

| ${I18n.t('configurationItem')} | ${I18n.t('value')} |
|--------|-----|
| ${I18n.t('traversalDepth')} | ${this.config.maxDepth} |
| ${I18n.t('outputFormatConfig')} | ${this.config.outputFormat} |
| ${I18n.t('outputFileNameConfig')} | ${this.config.outputFileName} |
| ${I18n.t('autoMonitoringConfig')} | ${this.config.autoMonitoring ? I18n.t('enabled') : I18n.t('disabled')} |
| ${I18n.t('extractFields')} | ${this.config.includeFields.join(', ')} |

---

`;
  }

  private generateFooter(): string {
    return `---

*${I18n.t('tipMessage')}: ${I18n.t('customConfigTip')}*`;
  }
}
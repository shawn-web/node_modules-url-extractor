import * as vscode from 'vscode';
import { DependencyTree } from './DependencyTree';

export class DependencyDetailProvider {
  private webviewPanel: vscode.WebviewPanel | undefined;

    public showDetail(packageData: any, packageName: string, treeData?: any, dependencyTree?: DependencyTree | null): void {
    // 如果已经有打开的面板，就重用它
    if (this.webviewPanel) {
      // 更新面板内容
      this.webviewPanel.title = `📦 ${packageName} - 依赖详情`;
      this.webviewPanel.webview.html = this.getWebviewContent(packageData, packageName, dependencyTree);
      // 让面板重新获得焦点
      this.webviewPanel.reveal();
      return;
    }

    // 创建新的webview面板
    this.webviewPanel = vscode.window.createWebviewPanel(
      'dependencyDetail',
      `📦 ${packageName} - 依赖详情`,
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // 设置HTML内容
    this.webviewPanel.webview.html = this.getWebviewContent(packageData, packageName, dependencyTree);

    // 处理面板关闭事件
    this.webviewPanel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });
  }

  private getWebviewContent(packageData: any, packageName: string, dependencyTree?: DependencyTree | null): string {
    const urls = packageData.urls || {};
    const version = packageData.version || 'unknown';
    const path = packageData.path || '';
    const description = packageData.description || '';
    const author = packageData.author || '';
    const license = packageData.license || '';
    const keywords = packageData.keywords || [];
    const dependencyType = packageData.dependencyType || 'dependencies';
    const depth = packageData.depth || 1;

    // HTML转义函数
    const escapeHtml = (text: string): string => {
      const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    // JavaScript字符串转义函数
    const escapeJs = (text: string): string => {
      return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    };

    // URL清理和验证函数
    const cleanUrl = (url: string): string => {
      if (!url) return '';

      let cleanUrl = url.trim();

      // 移除Git URL前缀
      if (cleanUrl.startsWith('git+')) {
        cleanUrl = cleanUrl.substring(4);
      }
      if (cleanUrl.startsWith('git://')) {
        cleanUrl = cleanUrl.replace('git://', 'https://');
      }
      if (cleanUrl.endsWith('.git')) {
        cleanUrl = cleanUrl.slice(0, -4);
      }

      // 如果没有协议，添加https://
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('mailto:')) {
        cleanUrl = `https://${cleanUrl}`;
      }

      return cleanUrl;
    };

    // 生成URL列表HTML
    let urlHtml = '';
    const urlTypes = [
      { key: 'homepage', name: '主页', icon: '🏠' },
      { key: 'repository', name: '代码仓库', icon: '📁' },
      { key: 'bugs', name: '问题反馈', icon: '🐛' },
      { key: 'documentation', name: '文档', icon: '📚' }
    ];

    for (const urlType of urlTypes) {
      const originalUrl = urls[urlType.key];
      if (originalUrl) {
        const cleanedUrl = cleanUrl(originalUrl);
        urlHtml += `
                    <div class="url-item">
                        <span class="url-icon">${urlType.icon}</span>
                        <span class="url-type">${urlType.name}</span>
                        <a href="${escapeHtml(cleanedUrl)}" class="url-link" target="_blank" rel="noopener noreferrer">${escapeHtml(originalUrl)}</a>
                        <button class="copy-btn" onclick="copyToClipboard('${escapeJs(originalUrl)}')">📋</button>
                    </div>
                `;
      }
    }

    // 格式化作者信息
    const formatAuthor = (author: any): string => {
      if (!author) return '未知';
      if (typeof author === 'string') return author;
      if (typeof author === 'object' && author.name) {
        return author.email ? `${author.name} <${author.email}>` : author.name;
      }
      return '未知';
    };

        // 获取依赖类型的中文显示
        const getDependencyTypeLabel = (type: string): string => {
            const labels: { [key: string]: string } = {
                'dependencies': '生产依赖',
                'devDependencies': '开发依赖',
                'peerDependencies': '对等依赖',
                'optionalDependencies': '可选依赖'
            };
            return labels[type] || '其他依赖';
        };

        // 获取依赖类型的图标
        const getDependencyIcon = (type: string): string => {
            const icons: { [key: string]: string } = {
                'dependencies': '🔧',  // 生产依赖 - 工具图标
                'devDependencies': '🛠️', // 开发依赖 - 构建图标
                'peerDependencies': '🤝', // 对等依赖 - 握手图标
                'optionalDependencies': '⚡' // 可选依赖 - 闪电图标
            };
            return icons[type] || '📦';
        };

        // 构建父级依赖链路
        const buildDependencyChain = (packageData: any): string[] => {
            const chain: string[] = [];
            
            // 添加当前包的依赖类型和包名
            if (packageData.dependencyType) {
                const icon = getDependencyIcon(packageData.dependencyType);
                const typeLabel = getDependencyTypeLabel(packageData.dependencyType);
                chain.push(`${icon} ${typeLabel}`);
            }
            
            // 如果有 DependencyTree 实例，获取完整的依赖路径
            if (dependencyTree) {
                const fullPath = dependencyTree.getDependencyPath(packageName);
                if (fullPath.length > 1) {
                    // 移除最后一个元素（当前包），因为后面会单独添加
                    const parentPath = fullPath.slice(0, -1);
                    parentPath.forEach(parent => {
                        chain.push(`📦 ${parent}`);
                    });
                }
            }
            
            chain.push(`📦 ${packageName}`);
            
            return chain;
        };

    return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${packageName} 依赖详情</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                
                .header {
                    border-bottom: 2px solid var(--vscode-panel-border);
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                
                .package-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: var(--vscode-textLink-foreground);
                }
                
                .package-info {
                    display: flex;
                    gap: 15px;
                    font-size: 14px;
                    color: var(--vscode-descriptionForeground);
                }
                
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: var(--vscode-textLink-foreground);
                }
                
                .url-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    margin-bottom: 8px;
                    background-color: var(--vscode-textBlockQuote-background);
                    border-radius: 6px;
                    border-left: 4px solid var(--vscode-textLink-activeForeground);
                }
                
                .url-icon {
                    font-size: 18px;
                }
                
                .url-type {
                    font-weight: 600;
                    min-width: 80px;
                }
                
                .url-link {
                    flex: 1;
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                    word-break: break-all;
                }
                
                .url-link:hover {
                    color: var(--vscode-textLink-activeForeground);
                    text-decoration: underline;
                }
                
                .copy-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 5px;
                    border-radius: 3px;
                }
                
                .copy-btn:hover {
                    background-color: var(--vscode-toolbar-hoverBackground);
                }
                
                .no-urls {
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                    text-align: center;
                    padding: 20px;
                }
                
                .path-info {
                    font-family: monospace;
                    background-color: var(--vscode-textBlockQuote-background);
                    padding: 10px;
                    border-radius: 4px;
                    word-break: break-all;
                    margin-top: 10px;
                }

                .description-info {
                    background-color: var(--vscode-textBlockQuote-background);
                    padding: 15px;
                    border-radius: 6px;
                    border-left: 4px solid var(--vscode-textLink-activeForeground);
                    line-height: 1.6;
                    font-size: 14px;
                }

                .detail-grid {
                    display: grid;
                    gap: 12px;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    padding: 10px;
                    background-color: var(--vscode-textBlockQuote-background);
                    border-radius: 6px;
                    border: 1px solid var(--vscode-panel-border);
                }

                .detail-label {
                    font-weight: 600;
                    color: var(--vscode-textLink-foreground);
                    font-size: 13px;
                }

                .detail-value {
                    color: var(--vscode-editor-foreground);
                    font-size: 14px;
                    word-break: break-all;
                }

                .keywords-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 5px;
                }

                .keyword-tag {
                    background-color: var(--vscode-textLink-activeForeground);
                    color: var(--vscode-editor-background);
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .dependency-chain {
                    margin-top: 12px;
                    padding: 10px;
                    background-color: var(--vscode-textBlockQuote-background);
                    border-radius: 6px;
                    border-left: 4px solid var(--vscode-textLink-activeForeground);
                }

                .chain-title {
                    font-weight: 600;
                    color: var(--vscode-textLink-foreground);
                    font-size: 13px;
                    margin-bottom: 6px;
                }

                .chain-items {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 5px;
                }

                .chain-item {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .chain-arrow {
                    color: var(--vscode-textLink-foreground);
                    font-weight: bold;
                    margin: 0 2px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="package-name">${getDependencyIcon(dependencyType)} ${packageName}</div>
                <div class="package-info">
                    <div class="info-item">
                        <span>🔖 版本:</span>
                        <span>${version}</span>
                    </div>
                    <div class="info-item">
                        <span>📋 类型:</span>
                        <span>${getDependencyTypeLabel(dependencyType)}</span>
                    </div>
                </div>
                ${buildDependencyChain(packageData).length > 0 ? `
                <div class="dependency-chain">
                    <div class="chain-title">📊 依赖链路:</div>
                    <div class="chain-items">
                        ${buildDependencyChain(packageData).map((item, index) => 
                            `<span class="chain-item">${item}</span>${index < buildDependencyChain(packageData).length - 1 ? '<span class="chain-arrow"> → </span>' : ''}`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            ${description ? `
            <div class="section">
                <div class="section-title">📝 描述</div>
                <div class="description-info">${description}</div>
            </div>
            ` : ''}

            <div class="section">
                <div class="section-title">ℹ️ 详细信息</div>
                <div class="detail-grid">
                    ${author ? `
                    <div class="detail-item">
                        <span class="detail-label">👤 作者:</span>
                        <span class="detail-value">${formatAuthor(author)}</span>
                    </div>
                    ` : ''}
                    ${license ? `
                    <div class="detail-item">
                        <span class="detail-label">⚖️ 许可证:</span>
                        <span class="detail-value">${license}</span>
                    </div>
                    ` : ''}
                    ${keywords.length > 0 ? `
                    <div class="detail-item">
                        <span class="detail-label">🏷️ 关键词:</span>
                        <div class="keywords-container">
                            ${keywords.map((keyword: string) => `<span class="keyword-tag">${keyword}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="detail-label">📁 安装路径:</span>
                    </div>
                </div>
                <div class="path-info">${path}</div>
            </div>

            <div class="section">
                <div class="section-title">🔗 相关链接</div>
                ${urlHtml || '<div class="no-urls">暂无URL信息</div>'}
            </div>

            <script>
                // 安全的复制函数
                function copyToClipboard(text) {
                    // 解码HTML实体
                    const decodedText = new DOMParser().parseFromString(text, 'text/html').documentElement.textContent || text;
                    navigator.clipboard.writeText(decodedText).then(() => {
                        // 简单的复制成功提示
                        const event = new CustomEvent('copySuccess', { detail: decodedText });
                        document.dispatchEvent(event);
                    }).catch(err => {
                        console.error('复制失败:', err);
                        // 备用方法
                        const textArea = document.createElement('textarea');
                        textArea.value = decodedText;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        const event = new CustomEvent('copySuccess', { detail: decodedText });
                        document.dispatchEvent(event);
                    });
                }
                
                // 监听复制成功事件
                document.addEventListener('copySuccess', (e) => {
                    console.log('已复制到剪贴板:', e.detail);
                    // 可以添加用户友好的提示
                });

                // 阻止链接的默认行为，确保在新标签页打开
                document.addEventListener('DOMContentLoaded', function() {
                    document.querySelectorAll('.url-link').forEach(link => {
                        link.addEventListener('click', function(e) {
                            const href = this.getAttribute('href');
                            if (href) {
                                e.preventDefault();
                                window.open(href, '_blank', 'noopener,noreferrer');
                            }
                        });
                    });
                });
            </script>
        </body>
        </html>`;
  }
}
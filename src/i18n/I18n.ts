import { zhCN } from './zhCN';
import { en } from './en';
import { I18nConfig } from './I18nConfig';

export type SupportedLocale = 'zh-CN' | 'en';

export const i18nConfig: Record<SupportedLocale, I18nConfig> = {
    'zh-CN': zhCN,
    'en': en
};

export class I18n {
    private static currentLocale: SupportedLocale = 'zh-CN';
    private static changeListeners: Array<(locale: SupportedLocale) => void> = [];
    
    static setLocale(locale: SupportedLocale): void {
        const oldLocale = this.currentLocale;
        this.currentLocale = locale;
        
        // 通知所有监听器语言已改变
        if (oldLocale !== locale) {
            this.changeListeners.forEach(listener => listener(locale));
        }
    }
    
    static getCurrentLocale(): SupportedLocale {
        return this.currentLocale;
    }
    
    static t(key: keyof I18nConfig): string {
        return i18nConfig[this.currentLocale][key];
    }
    
    static tWithArgs(key: keyof I18nConfig, args: string[]): string {
        let template = i18nConfig[this.currentLocale][key];
        args.forEach((arg, index) => {
            template = template.replace(`{${index}}`, arg);
        });
        return template;
    }
    
    static onLanguageChange(listener: (locale: SupportedLocale) => void): void {
        this.changeListeners.push(listener);
    }
}
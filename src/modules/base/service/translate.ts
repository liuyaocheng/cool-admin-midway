import { I18N } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseSysMenuEntity } from '../entity/sys/menu';
import {
  App,
  Config,
  ILogger,
  IMidwayApplication,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
/**
 * 翻译服务
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class BaseTranslateService {
  @InjectEntityModel(BaseSysMenuEntity)
  baseSysMenuEntity: Repository<BaseSysMenuEntity>;

  // 基础路径
  basePath: string;

  @App()
  app: IMidwayApplication;

  @Inject()
  logger: ILogger;

  @Config('cool.i18n')
  config: {
    /** 是否开启 */
    enable: boolean;
    /** 语言 */
    languages: string[];
    /** 翻译服务 */
    serviceUrl?: string;
  };

  menuMap: Record<string, string> = {};

  msgMap: Record<string, string> = {};

  /**
   * 检查是否存在锁文件
   */
  private checkLockFile(type: 'menu' | 'msg'): boolean {
    const lockFile = path.join(this.basePath, type, '.lock');
    return fs.existsSync(lockFile);
  }

  /**
   * 创建锁文件
   */
  private createLockFile(type: 'menu' | 'msg'): void {
    const lockFile = path.join(this.basePath, type, '.lock');
    fs.writeFileSync(lockFile, new Date().toISOString());
  }

  /**
   * 加载翻译文件到内存
   */
  async loadTranslations() {
    if (!this.basePath) {
      this.basePath = path.join(this.app.getBaseDir(), '..', 'src', 'locales');
    }

    // 加载菜单翻译
    const menuDir = path.join(this.basePath, 'menu');
    if (fs.existsSync(menuDir)) {
      const files = fs.readdirSync(menuDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const language = file.replace('.json', '');
          const content = fs.readFileSync(path.join(menuDir, file), 'utf-8');
          const translations = JSON.parse(content);
          for (const [key, value] of Object.entries(translations)) {
            this.menuMap[`${language}:${key}`] = value as string;
          }
        }
      }
    }

    // 加载消息翻译
    const msgDir = path.join(this.basePath, 'msg');
    if (fs.existsSync(msgDir)) {
      const files = fs.readdirSync(msgDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const language = file.replace('.json', '');
          const content = fs.readFileSync(path.join(msgDir, file), 'utf-8');
          const translations = JSON.parse(content);
          for (const [key, value] of Object.entries(translations)) {
            this.msgMap[`${language}:${key}`] = value as string;
          }
        }
      }
    }
  }

  /**
   * 更新翻译映射
   * @param type 类型 menu | msg
   * @param language 语言
   */
  async updateTranslationMap(type: 'menu' | 'msg', language: string) {
    const dirPath = path.join(this.basePath, type);
    const file = path.join(dirPath, `${language}.json`);

    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      const translations = JSON.parse(content);
      const map = type === 'menu' ? this.menuMap : this.msgMap;

      for (const [key, value] of Object.entries(translations)) {
        map[`${language}:${key}`] = value as string;
      }
    }
  }

  /**
   * 翻译
   * @param type 类型 menu | msg
   * @param language 语言
   * @param text 原文
   * @returns 翻译后的文本
   */
  translate(type: 'menu' | 'msg', language: string, text: string): string {
    const map = type === 'menu' ? this.menuMap : this.msgMap;
    const key = `${language}:${text}`;
    return map[key] || text;
  }

  /**
   * 检查翻译
   */
  async check() {
    if (this.config?.enable) {
      this.basePath = path.join(this.app.getBaseDir(), '..', 'src', 'locales');

      const menuLockExists = this.checkLockFile('menu');
      const msgLockExists = this.checkLockFile('msg');

      if (!menuLockExists || !msgLockExists) {
        const tasks = [];
        if (!msgLockExists) {
          tasks.push(this.genBaseMsg());
        }
        if (!menuLockExists) {
          tasks.push(this.genBaseMenu());
        }
        await Promise.all(tasks);
        this.logger.info('All translations completed successfully');
        // 更新翻译映射
        await this.loadTranslations();
      } else {
        this.logger.info('Translation lock files exist, skipping translation');
        // 直接加载翻译文件到内存
        await this.loadTranslations();
      }
    }
  }

  /**
   * 生成基础菜单
   */
  async genBaseMenu() {
    const menus = await this.baseSysMenuEntity.find();
    const file = path.join(this.basePath, 'menu', 'zh-cn.json');
    const content = {};
    for (const menu of menus) {
      content[menu.name] = menu.name;
    }
    // 确保目录存在
    const msgDir = path.dirname(file);
    if (!fs.existsSync(msgDir)) {
      fs.mkdirSync(msgDir, { recursive: true });
    }
    const text = JSON.stringify(content, null, 2);
    fs.writeFileSync(file, text);
    this.logger.info('base menu generate success');
    const translatePromises = [];
    for (const language of this.config.languages) {
      if (language !== 'zh-cn') {
        translatePromises.push(
          this.invokeTranslate(
            text,
            language,
            path.join(this.basePath, 'menu'),
            'menu'
          )
        );
      }
    }
    await Promise.all(translatePromises);
    this.createLockFile('menu');
  }

  /**
   * 生成基础消息
   */
  async genBaseMsg() {
    const file = path.join(this.basePath, 'msg', 'zh-cn.json');
    const scanPath = path.join(this.app.getBaseDir(), '..', 'src', 'modules');
    const messages = {};

    // 递归扫描目录
    const scanDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (file.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const matches = content.match(
            /throw new CoolCommException\((['"])(.*?)\1\)/g
          );
          if (matches) {
            matches.forEach(match => {
              const message = match.match(/(['"])(.*?)\1/)[2];
              messages[message] = message;
            });
          }
        }
      }
    };

    // 开始扫描
    scanDir(scanPath);

    // 确保目录存在
    const msgDir = path.dirname(file);
    if (!fs.existsSync(msgDir)) {
      fs.mkdirSync(msgDir, { recursive: true });
    }

    // 写入文件
    const text = JSON.stringify(messages, null, 2);
    fs.writeFileSync(file, text);
    this.logger.info('base msg generate success');

    const translatePromises = [];
    for (const language of this.config.languages) {
      if (language !== 'zh-cn') {
        translatePromises.push(
          this.invokeTranslate(
            text,
            language,
            path.join(this.basePath, 'msg'),
            'msg'
          )
        );
      }
    }
    await Promise.all(translatePromises);
    this.createLockFile('msg');
  }

  /**
   * 调用翻译
   * @param text 文本
   * @param language 语言
   * @param dirPath 目录
   * @param type 类型
   * @returns
   */
  async invokeTranslate(
    text: string,
    language: string,
    dirPath: string,
    type: 'menu' | 'msg' = 'msg'
  ) {
    this.logger.info(`${type} ${language} translate start`);
    const response = await axios.post(I18N.DEFAULT_SERVICE_URL, {
      label: 'i18n-node',
      params: {
        text,
        language,
      },
      stream: false,
    });
    const file = path.join(dirPath, `${language}.json`);
    fs.writeFileSync(file, response.data.data.result.data);
    this.logger.info(`${type} ${language} translate success`);
  }
}

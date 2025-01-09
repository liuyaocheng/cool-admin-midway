import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { ReportMiddleware } from './middleware/report.middleware';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import * as cool from '@cool-midway/core';

@Configuration({
  imports: [
    koa,
    validate,
    // cool-admin 官方组件 https://cool-js.com
    cool,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
    },
  ],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}

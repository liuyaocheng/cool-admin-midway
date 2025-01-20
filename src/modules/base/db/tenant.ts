import { EventSubscriberModel } from '@midwayjs/typeorm';
import {
  DeleteQueryBuilder,
  EntitySubscriberInterface,
  InsertQueryBuilder,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from 'typeorm';
import * as _ from 'lodash';
import {
  App,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
  AsyncContextManager,
  Config,
  IMidwayApplication,
  IMidwayContext,
  Inject,
} from '@midwayjs/core';
import { Utils } from '../../../comm/utils';

/**
 * 不操作租户
 * @param ctx
 * @param func
 */
export const noTenant = async (ctx, func) => {
  let result;
  const tenantId = ctx?.admin?.tenantId;
  if (tenantId) {
    ctx.admin.tenantId = null;
    result = await func();
    ctx.admin.tenantId = tenantId;
  } else {
    result = await func();
  }
  return result;
};

@EventSubscriberModel()
export class TenantSubscriber implements EntitySubscriberInterface<any> {
  @App()
  app: IMidwayApplication;

  @Inject()
  ctx: IMidwayContext;

  @Config('cool.tenant')
  tenant: {
    // 是否开启多租户
    enable: boolean;
    // 需要过滤多租户的url
    urls: string[];
  };

  @Inject()
  utils: Utils;

  /**
   * 检查是否需要租户
   */
  checkHandler() {
    const ctx = this.getCtx();
    if (!ctx) return false;
    const url = ctx?.url;
    if (!url) return false;
    if (this.tenant.enable) {
      const isNeedTenant = this.tenant.urls.some(pattern =>
        this.utils.matchUrl(pattern, url)
      );
      return isNeedTenant;
    }
    return false;
  }

  /**
   * 获取ctx
   */
  getCtx(): any {
    try {
      const contextManager: AsyncContextManager = this.app
        .getApplicationContext()
        .get(ASYNC_CONTEXT_MANAGER_KEY);
      return contextManager.active().getValue(ASYNC_CONTEXT_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * 从登录的用户中获取租户ID
   * @returns string | undefined
   */
  getTenantId(): number | undefined {
    let ctx, url, tenantId;
    ctx = this.getCtx();
    if (!ctx || this.checkHandler()) return undefined;
    url = ctx?.url;

    if (_.startsWith(url, '/admin/')) {
      tenantId = ctx?.admin?.tenantId;
    } else if (_.startsWith(url, '/app/')) {
      tenantId = ctx?.user?.tenantId;
    }
    if (tenantId && url) {
      return tenantId;
    }
    return undefined;
  }

  /**
   * 查询时添加租户ID条件
   * @param queryBuilder
   */
  afterSelectQueryBuilder(queryBuilder: SelectQueryBuilder<any>) {
    if (!this.tenant.enable) return;
    const tenantId = this.getTenantId();
    if (tenantId) {
      queryBuilder.where('tenantId = :tenantId', { tenantId });
    }
  }

  /**
   * 插入时添加租户ID
   * @param queryBuilder
   */
  async afterInsertQueryBuilder(queryBuilder: InsertQueryBuilder<any>) {
    if (!this.tenant.enable) return;
    const tenantId = await this.getTenantId();
    if (tenantId) {
      queryBuilder.values({ tenantId });
    }
  }

  /**
   * 更新时添加租户ID和条件
   * @param queryBuilder
   */
  async afterUpdateQueryBuilder(queryBuilder: UpdateQueryBuilder<any>) {
    if (!this.tenant.enable) return;
    const tenantId = await this.getTenantId();
    if (tenantId) {
      queryBuilder.set({ tenantId });
      queryBuilder.where('tenantId = :tenantId', { tenantId });
    }
  }

  /**
   * 删除时添加租户ID和条件
   * @param queryBuilder
   */
  async afterDeleteQueryBuilder(queryBuilder: DeleteQueryBuilder<any>) {
    if (!this.tenant.enable) return;
    const tenantId = await this.getTenantId();
    if (tenantId) {
      queryBuilder.where('tenantId = :tenantId', { tenantId });
    }
  }
}

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
  IMidwayApplication,
  IMidwayContext,
  Inject,
} from '@midwayjs/core';

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

  /**
   * 从登录的用户中获取租户ID
   * @returns string | undefined
   */
  getTenantId(): number | undefined {
    const contextManager: AsyncContextManager = this.app
      .getApplicationContext()
      .get(ASYNC_CONTEXT_MANAGER_KEY);
    const ctx: any = contextManager.active().getValue(ASYNC_CONTEXT_KEY);
    const url = ctx?.url;
    if (_.startsWith(url, '/admin/')) {
      return ctx?.admin?.tenantId;
    }
  }

  /**
   * 查询时添加租户ID条件
   * @param queryBuilder
   */
  afterSelectQueryBuilder(queryBuilder: SelectQueryBuilder<any>) {
    const tenantId = this.getTenantId();
    if (tenantId) {
      queryBuilder.where('tenantId = :tenantId', { tenantId });
    }
  }

  // /**
  //  * 插入时添加租户ID
  //  * @param queryBuilder
  //  */
  // async afterInsertQueryBuilder(queryBuilder: InsertQueryBuilder<any>) {
  //   const tenantId = await this.getTenantId();
  //   if (tenantId) {
  //     queryBuilder.values({ tenantId });
  //   }
  // }

  // /**
  //  * 更新时添加租户ID和条件
  //  * @param queryBuilder
  //  */
  // async afterUpdateQueryBuilder(queryBuilder: UpdateQueryBuilder<any>) {
  //   const tenantId = await this.getTenantId();
  //   if (tenantId) {
  //     queryBuilder.set({ tenantId });
  //     queryBuilder.where('tenantId = :tenantId', { tenantId });
  //   }
  // }

  // /**
  //  * 删除时添加租户ID和条件
  //  * @param queryBuilder
  //  */
  // async afterDeleteQueryBuilder(queryBuilder: DeleteQueryBuilder<any>) {
  //   const tenantId = await this.getTenantId();
  //   if (tenantId) {
  //     queryBuilder.where('tenantId = :tenantId', { tenantId });
  //   }
  // }
}

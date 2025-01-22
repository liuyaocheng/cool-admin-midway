import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { DemoGoodsEntity } from '../entity/goods';

/**
 * 商品服务
 */
@Provide()
export class DemoTenantService extends BaseService {
  @InjectEntityModel(DemoGoodsEntity)
  demoGoodsEntity: Repository<DemoGoodsEntity>;

  /**
   * 使用多租户
   */
  async use() {}

  /**
   * 不使用多租户(局部不使用)
   */
  async noUse() {}

  /**
   * 无效多租户
   */
  async invalid() {}
}

import { DemoGoodsEntity } from './../entity/goods';
import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { noTenant } from '../../base/db/tenant';

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
  @InjectEntityModel(DemoGoodsEntity)
  demoGoodsEntity: Repository<DemoGoodsEntity>;

  @Inject()
  ctx;

  /**
   * 执行sql分页
   */
  async sqlPage(query) {
    await this.demoGoodsEntity.save({
      id: 1,
      title: '标题',
      price: 99.0,
      description: '商品描述',
      mainImage: 'https://cool-js.com/logo.png',
    });
    return this.sqlRenderPage(
      'select * from demo_goods ORDER BY id ASC',
      query,
      false
    );
  }

  /**
   * 执行entity分页
   */
  async entityPage(query) {
    const find = this.demoGoodsEntity.createQueryBuilder();
    return this.entityRenderPage(find, query);
  }

  async test() {
    const a = await this.demoGoodsEntity.createQueryBuilder().getMany();
    await noTenant(this.ctx, async () => {
      const b = await this.demoGoodsEntity.createQueryBuilder().getMany();
      console.log('b');
    });
    const c = await this.demoGoodsEntity.createQueryBuilder().getMany();
    console.log(a);
  }
}

import { CoolController, BaseController } from '@cool-midway/core';
import { DemoGoodsEntity } from '../../entity/goods';
import { Get, Inject } from '@midwayjs/core';
import { DemoGoodsService } from '../../service/goods';

/**
 * 商品模块-商品信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DemoGoodsEntity,
})
export class AdminDemoGoodsController extends BaseController {
  @Inject()
  demoGoodsService: DemoGoodsService;

  @Get('/test', { summary: '测试' })
  async test() {
    await this.demoGoodsService.test();
    return this.ok('test');
  }
}

import { CoolController, BaseController } from '@cool-midway/core';
import { DemoGoodsEntity } from '../../entity/goods';
import { Get, Inject } from '@midwayjs/core';
import { DemoGoodsService } from '../../service/goods';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 商品模块-商品信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DemoGoodsEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.description'],
    fieldEq: ['a.status'],
    fieldLike: ['a.title'],
    select: ['a.*', 'b.nickName as userName'],
    join: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.id = b.id',
      },
    ],
  },
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

import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../entity/info';
import { DemoGoodsEntity } from '../../../demo/entity/goods';

/**
 * 用户信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserInfoEntity,
  pageQueryOp: {
    fieldEq: ['status', 'gender', 'loginType'],
    fieldLike: ['b.title'],
    keyWordLikeFields: ['nickName', 'phone'],
    select: ['a.*', 'b.title as goodsName'],
    join: [
      {
        entity: DemoGoodsEntity,
        alias: 'b',
        condition: 'a.id = b.id',
      },
    ],
  },
})
export class AdminUserInfoController extends BaseController {}

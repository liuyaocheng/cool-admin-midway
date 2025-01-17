import { EventSubscriberModel } from '@midwayjs/typeorm';
import { EntitySubscriberInterface, TransactionCommitEvent } from 'typeorm';
import { BeforeQueryEvent } from 'typeorm/subscriber/event/QueryEvent';
import * as _ from 'lodash';

@EventSubscriberModel()
export class TenantSubscriber implements EntitySubscriberInterface<any> {
  /**
   * 查询前
   * @param event
   */
  // @ts-ignore
  beforeQuery(event: BeforeQueryEvent<any>, query: string, parameters: any[]) {
    if (_.startsWith(event.query, 'SELECT')) {
      query = 'SELECT * FROM "tenant11"';
      //   // 参数
      //   const parameters = event.parameters;
      //   // 连接
      //   const queryRunner = event.connection.createQueryRunner();
      //   event.connection.destroy();
      //   //   // sql语句
      //   //   const query = event.query;
      //   //   const queryRunner = connection.createQueryRunner();
      //   // 原来的event.queryRunner 干掉
      //   event.query = 'SELECT * FROM "tenant11"';
      //   throw new Error('test');
    }
  }
}

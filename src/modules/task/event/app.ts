import { Inject } from '@midwayjs/core';
import { CoolEvent, Event } from '@cool-midway/core';
import { TaskInfoService } from '../service/info';

/**
 * 应用事件
 */
@CoolEvent()
export class TaskAppEvent {
  @Inject()
  taskInfoService: TaskInfoService;

  @Event('onServerReady')
  async onServerReady() {
    this.taskInfoService.initTask();
  }
}

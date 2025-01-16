import { CoolController, BaseController } from '@cool-midway/core';
import { PluginService } from '../../../plugin/service/info';
import { Get, Inject } from '@midwayjs/core';

/**
 * 插件
 */
@CoolController()
export class OpenDemoPluginController extends BaseController {
  @Inject()
  pluginService: PluginService;

  @Get('/invoke', { summary: '调用插件' })
  async invoke() {
    // 获取插件实例
    const instance = await this.pluginService.getInstance('feishu');
    instance.sendByHook({
      msg_type: 'text',
      content: {
        text: '测试',
      },
    });
    return this.ok();
  }
}

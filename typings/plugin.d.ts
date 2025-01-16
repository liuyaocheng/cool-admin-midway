import * as feishu from './feishu';
import { BaseUpload, MODETYPE } from './upload';
type AnyString = string & {};
/**
 * 插件类型声明
 */
interface PluginMap {
  upload: BaseUpload;
  feishu: feishu.CoolPlugin;
}

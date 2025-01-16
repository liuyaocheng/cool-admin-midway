import { BasePlugin } from '@cool-midway/plugin-cli';
import axios from 'axios';
interface Message {
  /** 类型  */
  msg_type:
    | 'text'
    | 'post'
    | 'image'
    | 'file'
    | 'audio'
    | 'media'
    | 'sticker'
    | 'interactive'
    | 'share_chat'
    | 'share_user';
  /** 内容 */
  content: any;
}
/**
 * 飞书
 */
export declare class CoolPlugin extends BasePlugin {
  /**
   * 推送webHook消息
   * @param message
   * @returns
   */
  sendByHook(message: Message): Promise<axios.AxiosResponse<any, any>>;
  /**
   * 推送应用消息
   * @param message 消息
   * @param options receive_id 接收人 receive_id_type 接收人类型 message_id 消息ID uuid 消息唯一ID
   * @returns
   */
  sendByApp(
    message: Message,
    options: {
      receive_id: string;
      receive_id_type: 'open_id' | 'user_id' | 'chat_id' | 'union_id' | 'email';
      message_id?: string;
      uuid?: string;
    },
  ): Promise<axios.AxiosResponse<any, any>>;
  /**
   * 上传图片
   * @param filePath 文件路径
   * @param image_type message 用于发送消息 avatar 用于设置头像
   * @returns
   */
  uploadImage(
    filePath: string,
    image_type?: 'message' | 'avatar',
  ): Promise<any>;
  /**
   * 上传文件
   * @param filePath 文件路径
   * @param file_type 文件类型
   * @returns
   */
  uploadFile(
    filePath: any,
    file_type?: 'opus' | 'mp4' | 'pdf' | 'doc' | 'xls' | 'ppt' | 'stream',
  ): Promise<any>;
  /**
   * 获得聊天列表，如：应用所在的群组
   * @returns
   */
  chatList(): Promise<any>;
  /**
   *获得用户信息
   * @param options  emails 邮箱数组，mobiles 手机号数组 不能同时为空 include_resigned 是否包含离职员工
   * @returns
   */
  getUserInfos(options: {
    emails?: string[];
    mobiles?: string[];
    include_resigned?: boolean;
  }): Promise<any>;
  /**
   * 使用手机号或邮箱获取用户 ID
   * @param options emails 邮箱数组，mobiles 手机号数组 不能同时为空 include_resigned 是否包含离职员工
   * @returns
   */
  getUserIds(options: {
    emails?: string[];
    mobiles?: string[];
    include_resigned?: boolean;
  }): Promise<any>;
  /**
   * 获得token
   * @returns
   */
  getToken(): Promise<any>;
}
export declare const Plugin: typeof CoolPlugin;
export {};

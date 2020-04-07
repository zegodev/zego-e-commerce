# 即构官方小程序直播插件，提供直播推流及播放服务
---
## 更新日志

### 1.0.0（20200109）
- 插件提供推拉流功能

### 1.0.0（20200109）
- 首次发布插件

---
## 1 准备环境
请确保开发环境满足以下技术要求： 

* 已安装[微信开发者工具 | _blank](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/devtools.html?t=2018323)
* 使用微信小程序基础库 2.3.0 及以上版本

## 2 前提条件
* 小程序具备**电商平台**类目，可使用即构提供的插件“即构电商直播助手”。
> 在[微信公众平台](https://mp.weixin.qq.com/)注册登录小程序
>
> 微信小程序类目申请详见 [微信非个人主体小程序开放的服务类目](https://developers.weixin.qq.com/miniprogram/product/material/#%E9%9D%9E%E4%B8%AA%E4%BA%BA%E4%B8%BB%E4%BD%93%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%BC%80%E6%94%BE%E7%9A%84%E6%9C%8D%E5%8A%A1%E7%B1%BB%E7%9B%AE)

## 3 初始化
* [注册即构账号](https://console.zego.im/),
创建项目，获取AppID、APPSign等信息，[详见](https://doc.zego.im/CN/1122.html)


* ZEGO 分配给开发者的 URL（包含 HTTPS、WSS 协议），需要在微信公众平台进行“合法域名”配置后，小程序才能正常访问。

> 微信后台配置地址：[微信公众平台 | _blank](https://mp.weixin.qq.com/) -> 设置 -> 开发设置 -> 服务器域名。

> 请开发者将 ZEGO 分配的请求域名，按照协议分类，填到指定的 `request合法域名` 或者 `socket合法域名` 中。例如：  

![](https://storage.zego.im/sdk-doc/Pics/MiniProgram/domainconfig.png?v=Mon%20Jan%2020%202020%2011:01:37%20GMT+0800%20(CST))

## 4 集成插件+组件
* 提供了插件+组件模式，在demo 中封装了live-room 组件，可以在页面中引用该组件，该组件使用了“即构电商直播助手”，详见[demo源码](https://github.com/zegodev/zego-e-commerce)
> 在小程序管理后台即[微信公众平台](https://mp.weixin.qq.com/)的"设置-第三方设置"中选择"添加插件"，在弹出的面板中搜索"即构电商直播助手"，选中插件并添加。
> 
> 对于插件的使用者，使用插件前要在小程序工程的app.json中声明需要使用的插件，如下：

```
{
  ……
  "plugins": {
    "zego-e-commerce": {
      "version": "1.0.2",
      "provider": "wx2b8909dae7727f25"
    }
  }
}
```
> 主播停止推流10秒后，观众退出房间

* live-room 组件属性：

属性 | 类型 | 说明 |
---|---|---|
zegoAppID | String | 即构的appID |
userID | String | 用户id, 唯一 |
token | String | 登录认证的 |
loginType | String | “anchor” 或“audience” |
roomID | String | 房间号，全局唯一，只支持长度不超过 128 字节 的数字，下划线，字母 |
logServerURL | String | 即构日志上报地址 |
navBarHeight | Number | 导航栏高度 |
bindRoomEvent | EventHandle | 回调事件 |

* 登录房间需要token，在开发者的业务服务器实现token逻辑，详见[房间登录安全](https://doc.zego.im/CN/387.html#4_1)。

## 5 商品袋

在示例demo中，有一个商品列表，客户可以自定义商品的相关信息（简介、图片、列表、链接等），商品链接可以使用web-view链接到自己的域名下的商品页面，但需要在[小程序管理后台](https://mp.weixin.qq.com/)配置业务域名，此时需要下载一个校验文件，将该文件放置于域名根目录下。




## 6 内容安全审核

微信小程序有内容安全要求规范，需要开发者对发布的内容进行安全审查，详见   [关于微信小程序内容安全要求规范](https://developers.weixin.qq.com/community/develop/doc/00004843288058ed4039d223951401)，可通过接入微信公众平台内容安全API（imgSecCheck、msgSecCheck、mediaCheckAsync）能力，以及通过其他技术或人工审核手段做好内容审核，校验用户输入的文本/图片，拦截政治、色情、违法等敏感词。

使用检查文本内容安全api [security.msgSecCheck](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/sec-check/security.msgSecCheck.html),
该接口支持服务端调用及云调用。

1. 引入cloudfunctions 文件夹（其中msgcheck是建立的云函数目录），
此时结构

![image](http://zego-public.oss-cn-shanghai.aliyuncs.com/sdk-doc/struct.png)

在project.config.json中引入

```
  "cloudfunctionRoot": "cloudfunctions/",
```

2. 在app.json 引入

```
  "cloud": true,
```
3. 在开发者工具（>= 1.02.1904090）(wx-server-sdk >= 0.4.0）上“云开发”搭建云框架，在开发者工具右键点击msgcheck, 并上传部署（云端安装依赖）。
在cloudfunctions/msgcheck/index.js中把修改云开发的环境ID，
```
cloud.init({
  env: '填入云环境ID'
})
```
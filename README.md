# home-services-client

微信家政服务小程序



> [!IMPORTANT]
>
> 本项目使用了其他开源组件库
> 你需要下载组件库：[vant-weapp](https://github.com/youzan/vant-weapp)
> [vant-weapp快速上手](https://vant-ui.github.io/vant-weapp/#/quickstart)
>
> 



> [!NOTE]
>
> 目前只是一个本地端的项目


> [!IMPORTANT]
>
> idea创建时添加以下依赖：
>
> - Spring Web
> - Spring Data JPA
> - MySQL Driver
> - Lombok
> - Spring Boot DevTools



## TODO

最初计划

- [x] 登录页面
- [ ] 具备用户在线预约家政服务
- [ ] 支付订单
- [ ] 查看与评伦服务

---

新增优化计划

- [x] ~~目前遇到主包尺寸过大，需要进行分包~~（没啥事，图片太大了，扔其他地方了）

- [x] 删除点击设置时的登陆限制
- [x] ~~所有页面~~（除首页）添加节流效果
- [x] 去除点击“更多”、“地址管理”、“asset-card”跳转登录界面的功能
- [ ] 首页添加节流
---
- [ ] 首页功能实现（轮播图，实现节流等效果）。
- [ ] 商品页面设计
- [ ] 商品数据表的设计
- [x] 登录逻辑优化。
- [x] 订单获取，接入数据库。
- [ ] 添加获取头像功能。
- [ ] 下单，订单支付功能（扫码支付）（怎么返回支付成功？或者调用支付api）（支付提交订单到数据库时添加防抖）。
- [x] 优化原有数据库。
- [ ] 在设置页面添加注销功能，申请注销后会向开发者发出通知，进入7天注销等待期，七天内重新登陆则取消注销，在登陆界面添加验证，若账号处于等待期，提示“处于等待期，是否继续登录”，此时点击“确定”后才能进行登录，确定按钮有5s无法点击时间，需等待；此功能需要在数据库添加一个列，用于存储是否处于注销等待期。
- [ ] 个人信息可修改。
- [ ] 开放asset-card的积分，优惠券，收藏功能。





将来的将来，也许会把这个这个项目转为云开发。再说吧。





## 使用的第三方开源库说明

本项目基于 MIT 协议开源，部分组件使用了 Vant Weapp（MIT 协议），详见 LICENSE 文件。

---

### Vant Weapp

- 仓库地址：[https://github.com/youzan/vant-weapp](https://github.com/youzan/vant-weapp)
- 版权归属：© 2016-present Youzan
- 授权协议：MIT License


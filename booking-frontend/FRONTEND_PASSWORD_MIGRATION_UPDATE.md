# 前端密码迁移更新说明

## 概述

本次更新是为了配合后端密码加密算法从MD5升级到BCrypt而进行的前端适配工作。

## 主要更新内容

### 1. API端口更新
- **旧端口**: `8080`
- **新端口**: `8024`
- **原因**: 后端服务端口从8080更改为8024

### 2. 统一API配置管理

#### 新增配置文件
- **文件路径**: `utils/config.js`
- **功能**: 统一管理所有API接口地址和配置
- **优势**: 
  - 便于维护和修改
  - 避免硬编码
  - 统一管理API端点

#### 配置文件内容
```javascript
const config = {
  baseUrl: 'http://localhost:8024',
  api: {
    user: {
      login: '/api/user/login',
      register: '/api/user/register'
    },
    order: {
      list: '/api/order/list',
      detail: '/api/order/detail'
    },
    address: {
      list: '/api/address/list',
      add: '/api/address/add',
      update: '/api/address/update',
      delete: '/api/address/delete',
      setDefault: '/api/address/set-default',
      get: '/api/address/get'
    }
  }
}
```

### 3. 更新的页面文件

以下页面已更新为使用新的配置文件：

1. **登录页面** (`pages/login/login.js`)
   - 更新API端口
   - 使用统一配置

2. **注册页面** (`pages/register/register.js`)
   - 更新API端口
   - 使用统一配置

3. **首页** (`pages/index/index.js`)
   - 更新API端口
   - 使用统一配置

4. **订单页面** (`pages/order/order.js`)
   - 更新API端口
   - 使用统一配置

5. **订单详情页面** (`pages/order/detail/detail.js`)
   - 更新API端口
   - 使用统一配置

6. **地址管理页面** (`pages/user/address/address.js`)
   - 更新API端口
   - 使用统一配置

7. **地址编辑页面** (`pages/user/address/edit/edit.js`)
   - 更新API端口
   - 使用统一配置

8. **评论页面** (`pages/index/comments/comments.js`)
   - 更新API端口
   - 使用统一配置

9. **结算页面** (`pages/index/checkout/checkout.js`)
   - 更新API端口
   - 使用统一配置

10. **详情页面** (`pages/index/detail/detail.js`)
    - 更新API端口
    - 使用统一配置

## 密码迁移对前端的影响

### 用户体验
1. **新用户注册**: 无变化，正常注册流程
2. **现有用户登录**: 
   - 首次登录时，后端会自动将MD5密码迁移到BCrypt
   - 用户无感知，登录体验无变化
   - 密码迁移在后端自动完成

### 前端无需额外处理
- 前端不需要处理密码加密逻辑
- 密码迁移完全在后端处理
- 前端只需要正常发送用户名和密码到后端

## 部署注意事项

### 1. 确保后端服务正常运行
- 后端服务必须在端口8024上运行
- 数据库迁移脚本已执行
- BCrypt密码迁移功能已部署

### 2. 测试验证
- 测试新用户注册功能
- 测试现有用户登录功能
- 验证所有API接口正常工作

### 3. 生产环境配置
如果部署到生产环境，需要修改 `utils/config.js` 中的 `baseUrl`：
```javascript
// 生产环境示例
baseUrl: 'https://your-domain.com:8024'
```

## 回滚方案

如果需要回滚到旧版本：
1. 将 `utils/config.js` 中的端口改回 `8080`
2. 确保后端服务在8080端口运行
3. 恢复旧的密码验证逻辑

## 总结

本次前端更新主要是配合后端密码迁移的基础设施更新，包括：
- API端口从8080更新到8024
- 统一API配置管理
- 所有相关页面的API调用更新

前端用户体验保持不变，密码迁移过程对用户完全透明。
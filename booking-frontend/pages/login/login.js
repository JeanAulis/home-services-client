const { getApiUrl, config } = require('../../utils/config')

Page({
  data: {
    user_num: '',
    user_passwd: '',
    user_name: '',
    user_email: ''
  },
  onInputUserNum(e) {
    this.setData({ user_num: e.detail.value });
  },
  onInputUserPasswd(e) {
    this.setData({ user_passwd: e.detail.value });
  },
  onInputUserName(e) {
    this.setData({ user_name: e.detail.value });
  },
  onInputUserEmail(e) {
    this.setData({ user_email: e.detail.value });
  },
  onLogin() {
    // 验证输入
    if (!this.data.user_num || !this.data.user_passwd) {
      wx.showToast({ 
        title: '请输入完整信息', 
        icon: 'none' 
      });
      return;
    }
    
    wx.request({
      url: getApiUrl(config.api.user.login),
      method: 'POST',
      data: {
        userNum: this.data.user_num,
        userName: this.data.user_num,
        userEmail: this.data.user_num,
        userPasswd: this.data.user_passwd
      },
      success: res => {
        console.log('登录响应数据:', res.data);
        if (res.data.code === 200) {
          // 获取用户信息和资产信息
          const serverUserInfo = res.data.data.userInfo || {};
          const serverAssets = res.data.data.assets || {};
          
          // 确保用户信息包含必要字段
          const userInfo = {
            userId: serverUserInfo.userId,
            userNum: serverUserInfo.userNum,
            userName: serverUserInfo.userName,
            userEmail: serverUserInfo.userEmail, 
            avatarUrl: serverUserInfo.avatarUrl || '/icon/default-avatar.png',
            points: serverAssets.points || 0,
            coupons: serverAssets.coupons || 0,
            collections: serverAssets.collections || 0
          };
          console.log('准备保存的用户信息:', userInfo);
          
          // 存储用户信息到本地
          wx.setStorageSync('userInfo', userInfo);
          wx.showToast({ title: '登录成功', icon: 'success' });
          
          // 获取当前页面栈
          const pages = getCurrentPages();
          if (pages.length > 1) {
            // 如果有上一页，则返回上一页
            wx.navigateBack({
              delta: 1
            });
          } else {
            // 如果没有上一页，则跳转到首页
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        } else {
          wx.showToast({ title: res.data.msg || '登录失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('登录请求失败:', err);
        wx.showToast({ 
          title: '网络错误，请稍后再试', 
          icon: 'none' 
        });
      }
    });
  },
  goRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
})
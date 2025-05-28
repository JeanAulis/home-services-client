const { getApiUrl, config } = require('../../utils/config')

Page({
  data: {
    // 删除 user_num
    user_passwd: '',
    user_name: '',
    user_email: ''
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
  onRegister() {
    // 验证输入
    if (!this.data.user_name || !this.data.user_passwd) {
      wx.showToast({ 
        title: '用户名和密码不能为空', 
        icon: 'none' 
      });
      return;
    }
    
    wx.request({
      url: getApiUrl(config.api.user.register),
      method: 'POST',
      data: {
        userName: this.data.user_name,
        userPasswd: this.data.user_passwd,
        userEmail: this.data.user_email
      },
      success: res => {
        if (res.data.code === 200) {
          wx.showToast({ title: '注册成功', icon: 'success' });
          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/login/login' });
          }, 1500);
        } else if (res.data.code === 400) {
          wx.showToast({ title: '用户名已存在', icon: 'none' });
        } else if (res.data.code === 401) {
          wx.showToast({ title: '邮箱格式不合法', icon: 'none' });
        } else {
          wx.showToast({ title: res.data.msg || '注册失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ 
          title: '网络错误，请稍后再试', 
          icon: 'none' 
        });
      }
    });
  },
  
  // 添加返回登录页的方法
  goLogin() {
    wx.navigateBack();
  }
})
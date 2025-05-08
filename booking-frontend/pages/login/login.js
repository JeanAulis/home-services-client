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
    wx.request({
      url: 'http://localhost:8124/api/user/login',
      method: 'POST',
      data: {
        userNum: this.data.user_num,
        userName: this.data.user_num,
        userEmail: this.data.user_num,
        userPasswd: this.data.user_passwd
      },
      success: res => {
        if (res.data.code === 200) {
          wx.showToast({ title: '登录成功', icon: 'success' });
          wx.redirectTo({ url: '/pages/index/index' });
        } else {
          wx.showToast({ title: res.data.msg || '登录失败', icon: 'none' });
        }
      }
    });
  },
  goRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
})
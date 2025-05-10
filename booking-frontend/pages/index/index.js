// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    // 轮播图数据
    banners: [
      { imageUrl: '/images/banner1.jpg' },
      { imageUrl: '/images/banner2.jpg' },
      { imageUrl: '/images/banner3.jpg' }
    ],
    // 服务分类数据
    categories: [
      { id: 1, name: '家居清洁', iconUrl: '/icon/clean.png' },
      { id: 2, name: '家电维修', iconUrl: '/icon/repair.png' },
      { id: 3, name: '管道疏通', iconUrl: '/icon/plumbing.png' },
      { id: 4, name: '搬家服务', iconUrl: '/icon/moving.png' },
      { id: 5, name: '家具安装', iconUrl: '/icon/furniture.png' }
    ],
    // 热门服务数据
    popularServices: [
      { id: 1, name: '全屋深度清洁', price: 299, imageUrl: '/images/service1.jpg' },
      { id: 2, name: '空调清洗', price: 129, imageUrl: '/images/service2.jpg' },
      { id: 3, name: '油烟机清洗', price: 99, imageUrl: '/images/service3.jpg' }
    ],
    // 推荐服务商数据
    providers: [
      { id: 1, name: '专业清洁公司', avatarUrl: '/images/provider1.jpg', rating: 4.9, ratingCount: 258 },
      { id: 2, name: '小明维修', avatarUrl: '/images/provider2.jpg', rating: 4.8, ratingCount: 186 },
      { id: 3, name: '家电医生', avatarUrl: '/images/provider3.jpg', rating: 4.7, ratingCount: 152 }
    ]
  },
  
  onLoad() {
    // 创建模拟图片
    this.createMockImages();
  },
  
  // 创建模拟图片（当实际图片不存在时使用）
  createMockImages() {
    // 检查图片是否存在，不存在则使用默认图标
    const checkAndSetDefaultImage = (array, urlProperty) => {
      return array.map(item => {
        const tempImageUrl = item[urlProperty];
        // 使用默认图片代替
        if (tempImageUrl.startsWith('/images/')) {
          item[urlProperty] = defaultAvatarUrl;
        }
        return item;
      });
    };
    
    this.setData({
      banners: checkAndSetDefaultImage(this.data.banners, 'imageUrl'),
      popularServices: checkAndSetDefaultImage(this.data.popularServices, 'imageUrl'),
      providers: checkAndSetDefaultImage(this.data.providers, 'avatarUrl')
    });
  },
  
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  
  // 搜索功能
  onSearch(e) {
    const searchValue = e.detail.value;
    console.log('搜索内容:', searchValue);
    // 这里添加搜索逻辑
    wx.showToast({
      title: '搜索: ' + searchValue,
      icon: 'none'
    });
    // 可以发起搜索请求
    // this.searchServices(searchValue);
  },
  
  // 搜索服务
  searchServices(keyword) {
    // 实现搜索逻辑
    // 例如:
    // wx.request({
    //   url: 'your-api-url/search',
    //   data: { keyword: keyword },
    //   success: (res) => {
    //     // 处理搜索结果
    //     this.setData({
    //       searchResults: res.data
    //     });
    //   }
    // });
  }
})

// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const baseUrl = 'http://localhost:8080'; // 后端API基础URL

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
      { id: 1, name: '家居清洁', iconUrl: '/icon/clean.png', type: 'CLEANING' },
      { id: 2, name: '家电维修', iconUrl: '/icon/repair.png', type: 'REPAIR' },
      { id: 3, name: '管道疏通', iconUrl: '/icon/plumbing.png', type: 'PLUMBING' },
      { id: 4, name: '搬家服务', iconUrl: '/icon/moving.png', type: 'MOVING' },
      { id: 5, name: '家具安装', iconUrl: '/icon/furniture.png', type: 'FURNITURE' }
    ],
    // 热门服务数据
    popularServices: [],
    // 新品服务
    newServices: [],
    // 加载状态
    loading: {
      hot: true,
      new: true
    }
  },
  
  onLoad() {
    // 创建模拟图片
    this.createMockImages();
    // 获取热门服务
    this.getHotProducts();
    // 获取新品服务
    this.getNewProducts();
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
      banners: checkAndSetDefaultImage(this.data.banners, 'imageUrl')
    });
  },
  
  // 获取热门服务
  getHotProducts(type = '') {
    this.setData({
      'loading.hot': true
    });
    
    wx.request({
      url: `${baseUrl}/api/product/hot`,
      data: {
        type: type,
        limit: 6
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          // 处理服务数据
          const products = res.data.data.map(product => {
            // 处理图片路径，如果是多张图片（逗号分隔），取第一张
            let imageUrl = defaultAvatarUrl;
            if (product.productImages) {
              const images = product.productImages.split(',');
              if (images.length > 0 && images[0]) {
                imageUrl = images[0];
              }
            }
            
            return {
              id: product.productId,
              productNum: product.productNum,
              name: product.productName,
              price: product.price,
              imageUrl: imageUrl,
              salesCount: product.salesCount,
              productType: product.productType,
              rating: 4.8 // 评分暂时使用默认值，实际应从评论统计中获取
            };
          });
          
          this.setData({
            popularServices: products,
            'loading.hot': false
          });
        } else {
          wx.showToast({
            title: '获取热门服务失败',
            icon: 'none'
          });
          this.setData({
            'loading.hot': false
          });
        }
      },
      fail: (err) => {
        console.error('获取热门服务失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        this.setData({
          'loading.hot': false
        });
      }
    });
  },
  
  // 获取新品服务
  getNewProducts() {
    this.setData({
      'loading.new': true
    });
    
    wx.request({
      url: `${baseUrl}/api/product/new`,
      data: {
        limit: 3
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          // 处理服务数据
          const products = res.data.data.map(product => {
            // 处理图片路径，如果是多张图片（逗号分隔），取第一张
            let imageUrl = defaultAvatarUrl;
            if (product.productImages) {
              const images = product.productImages.split(',');
              if (images.length > 0 && images[0]) {
                imageUrl = images[0];
              }
            }
            
            return {
              id: product.productId,
              productNum: product.productNum,
              name: product.productName,
              price: product.price,
              imageUrl: imageUrl,
              publishDate: product.publishDate,
              productType: product.productType
            };
          });
          
          this.setData({
            newServices: products,
            'loading.new': false
          });
        } else {
          wx.showToast({
            title: '获取新品服务失败',
            icon: 'none'
          });
          this.setData({
            'loading.new': false
          });
        }
      },
      fail: (err) => {
        console.error('获取新品服务失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        this.setData({
          'loading.new': false
        });
      }
    });
  },
  
  // 按类型筛选服务
  filterByCategory(e) {
    const type = e.currentTarget.dataset.type;
    if (type) {
      this.getHotProducts(type);
    } else {
      this.getHotProducts();
    }
  },
  
  // 跳转到商品详情页
  navigateToProduct(e) {
    const productNum = e.currentTarget.dataset.productNum;
    if (productNum) {
      wx.navigateTo({
        url: `/pages/index/detail/detail?productNum=${productNum}`
      });
    }
  },
  
  // 跳转到搜索页面
  navigateToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },
  
  // 搜索功能
  onSearch(e) {
    const searchValue = e.detail.value;
    if (searchValue && searchValue.trim()) {
      wx.navigateTo({
        url: `/pages/search/search?keyword=${encodeURIComponent(searchValue.trim())}`
      });
    }
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

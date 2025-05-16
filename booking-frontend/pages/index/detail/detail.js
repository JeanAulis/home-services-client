// detail.js
const app = getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const apiBaseUrl = 'http://localhost:8080'; // 设置API基础URL，根据实际情况修改
const vantImageUrl = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'; // Vant组件库提供的默认图片
const defaultVideoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const defaultDetailImageUrls = [
  'https://raw.githubusercontent.com/JeanAulis/ImageHostingService/main/cover-001.png',
  'https://raw.githubusercontent.com/JeanAulis/ImageHostingService/main/cover-002.png',
  'https://raw.githubusercontent.com/JeanAulis/ImageHostingService/main/cover-003.png'
];

// 获取随机默认详情图片URL
function getRandomDetailImage() {
  const randomIndex = Math.floor(Math.random() * defaultDetailImageUrls.length);
  return defaultDetailImageUrls[randomIndex];
}

// 按索引获取固定图片（循环使用三张图片）
function getImageByIndex(index) {
  return defaultDetailImageUrls[index % defaultDetailImageUrls.length];
}

Page({
  data: {
    productNum: '',
    loading: true,
    product: {},
    statistics: {},
    comments: [],
    productImages: [],
    fullStars: [],
    hasHalfStar: false,
    emptyStars: [],
    defaultAvatarUrl: defaultAvatarUrl,
    hasVideo: true, // 始终显示视频
    videoUrl: defaultVideoUrl // 直接设置默认视频URL
  },
  
  onLoad(options) {
    // 从路由参数中获取商品编号
    if (options.productNum) {
      this.setData({
        productNum: options.productNum
      });
      
      // 获取商品详情
      this.getProductDetail(options.productNum);
      
      // 获取商品评论
      this.getProductComments(options.productNum);
    } else {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  onPullDownRefresh() {
    // 下拉刷新
    this.getProductDetail(this.data.productNum);
    this.getProductComments(this.data.productNum);
    wx.stopPullDownRefresh();
  },
  
  // 获取商品详情
  getProductDetail(productNum) {
    this.setData({ loading: true });
    
    wx.request({
      url: `${apiBaseUrl}/api/product/detail`,
      data: {
        productNum: productNum
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const responseData = res.data.data;
          const product = responseData.product;
          const statistics = responseData.statistics;
          
          // 强制使用我们的三张默认图片
          const productImages = [
            defaultDetailImageUrls[0],
            defaultDetailImageUrls[1],
            defaultDetailImageUrls[2]
          ];
          
          // 处理评分星星
          this.processRatingStars(statistics.averageRating || 0);
          
          this.setData({
            product: product,
            statistics: statistics,
            productImages: productImages,
            // 直接设置视频相关属性，不从数据库获取
            // videoUrl: videoUrl,
            // hasVideo: hasVideo,
            loading: false
          });
        } else {
          wx.showToast({
            title: '获取商品详情失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('获取商品详情失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },
  
  // 获取商品评论
  getProductComments(productNum) {
    wx.request({
      url: `${apiBaseUrl}/api/comment/product`,
      data: {
        productNum: productNum,
        page: 1,
        size: 3, // 只获取前3条评论
        sortBy: 'createdAt',
        order: 'desc'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const comments = res.data.data.comments;
          
          // 处理评论数据
          const processedComments = comments.map(comment => {
            // 格式化日期
            let commentDate = '未知时间';
            if (comment.createdAt) {
              const date = new Date(comment.createdAt);
              commentDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            }
            
            // 处理评论图片
            let commentImages = [];
            if (comment.commentImages) {
              commentImages = comment.commentImages.split(',').filter(img => img && img.trim() !== '');
            }
            
            // 处理评分星星
            const ratingStars = this.calculateRatingStars(comment.rating || 0);
            
            return {
              ...comment,
              commentDate,
              commentImages,
              ratingStars,
              commentContent: comment.commentText || comment.commentContent || ''
            };
          });
          
          this.setData({
            comments: processedComments
          });
        } else {
          console.error('获取商品评论失败:', res.data.msg);
        }
      },
      fail: (err) => {
        console.error('获取商品评论失败:', err);
      }
    });
  },
  
  // 处理评分星星
  processRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    this.setData({
      fullStars: Array(fullStars).fill(0),
      hasHalfStar,
      emptyStars: Array(emptyStars).fill(0)
    });
  },
  
  // 计算单个评论的星星
  calculateRatingStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    
    return {
      full: Array(full).fill(0),
      half,
      empty: Array(empty).fill(0)
    };
  },
  
  // 图片预览
  previewImage(e) {
    const urls = e.currentTarget.dataset.urls;
    const current = e.currentTarget.dataset.current;
    
    wx.previewImage({
      urls,
      current
    });
  },
  
  // 跳转到评论列表
  navigateToComments() {
    wx.navigateTo({
      url: `../comments/comments?productNum=${this.data.productNum}`
    });
  },
  
  // 加入购物车
  addToCart() {
    // 获取用户信息，检查是否登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.userNum) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 添加到购物车逻辑
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });
  },
  
  // 立即购买
  buyNow() {
    // 获取用户信息，检查是否登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.userNum) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 跳转到订单结算页面
    wx.navigateTo({
      url: `/pages/index/checkout/checkout?serviceId=${this.data.productNum}`
    });
  },
  
  // 处理导航栏返回按钮点击
  handleNavBack() {
    wx.navigateBack({
      delta: 1
    });
  }
}) 
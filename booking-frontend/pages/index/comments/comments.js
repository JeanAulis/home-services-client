// comments.js
const { getApiUrl, config } = require('../../../utils/config')
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    productNum: '',
    currentPage: 1,
    hasMore: true,
    loading: true,
    statistics: {},
    comments: [],
    currentFilter: 'all', // 当前评论筛选, 可选值: all, withImages, highScore, mediumScore, lowScore
    fullStars: [],
    hasHalfStar: false,
    emptyStars: [],
    ratingDistribution: [], // 评分分布
    defaultAvatarUrl: defaultAvatarUrl
  },
  
  onLoad(options) {
    if (options.productNum) {
      this.setData({
        productNum: options.productNum
      });
      
      // 获取商品评论统计
      this.getCommentStatistics(options.productNum);
      
      // 获取商品评论
      this.getComments(options.productNum, 1, 'all');
    } else {
      wx.showToast({
        title: '评论加载失败',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  onPullDownRefresh() {
    // 下拉刷新，重置页码，重新加载数据
    this.setData({
      currentPage: 1,
      hasMore: true,
      comments: []
    });
    
    this.getCommentStatistics(this.data.productNum);
    this.getComments(this.data.productNum, 1, this.data.currentFilter);
    
    wx.stopPullDownRefresh();
  },
  
  // 获取商品评论统计
  getCommentStatistics(productNum) {
    wx.request({
      url: `${config.baseUrl}/api/comment/product`,
      data: {
        productNum: productNum,
        page: 1,
        size: 1 // 只需要统计信息
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const statistics = res.data.data.statistics;
          
          // 处理评分星星
          this.processRatingStars(statistics.averageRating || 0);
          
          // 处理评分分布
          let ratingDistribution = [];
          if (statistics.ratingDistribution) {
            const totalComments = statistics.totalComments || 0;
            for (let i = 1; i <= 5; i++) {
              const count = statistics.ratingDistribution[i] || 0;
              // 计算百分比，确保至少有1%的宽度便于显示
              const percentage = totalComments > 0 ? Math.max(1, Math.round((count / totalComments) * 100)) : 0;
              ratingDistribution.push({
                count,
                percentage
              });
            }
          }
          
          this.setData({
            statistics,
            ratingDistribution
          });
        }
      },
      fail: (err) => {
        console.error('获取评论统计失败:', err);
      }
    });
  },
  
  // 获取商品评论
  getComments(productNum, page, filter) {
    this.setData({ loading: true });
    
    // 根据筛选条件构建请求参数
    let requestData = {
      productNum: productNum,
      page: page,
      size: 10,
      sortBy: 'createdAt',
      order: 'desc'
    };
    
    // 添加筛选条件
    if (filter === 'withImages') {
      requestData.hasImages = true;
    } else if (filter === 'highScore') {
      requestData.minRating = 4;
    } else if (filter === 'mediumScore') {
      requestData.minRating = 3;
      requestData.maxRating = 3;
    } else if (filter === 'lowScore') {
      requestData.maxRating = 2;
    }
    
    wx.request({
      url: `${config.baseUrl}/api/comment/product`,
      data: requestData,
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const newComments = res.data.data.comments;
          const totalPages = res.data.data.totalPages;
          
          // 判断是否还有更多数据
          const hasMore = page < totalPages;
          
          // 处理评论数据
          const processedComments = newComments.map(comment => {
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
              // 确保前端模板中使用的字段名称与后端返回一致
              commentContent: comment.commentText || comment.commentContent || ''
            };
          });
          
          // 如果是第一页，直接设置；否则追加
          this.setData({
            comments: page === 1 ? processedComments : [...this.data.comments, ...processedComments],
            hasMore,
            currentPage: page,
            loading: false
          });
        } else {
          this.setData({ loading: false });
          wx.showToast({
            title: '获取评论失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取评论失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
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
  
  // 设置筛选条件
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (filter !== this.data.currentFilter) {
      this.setData({
        currentFilter: filter,
        currentPage: 1,
        hasMore: true,
        comments: []
      });
      
      this.getComments(this.data.productNum, 1, filter);
    }
  },
  
  // 加载更多评论
  loadMoreComments() {
    if (this.data.hasMore && !this.data.loading) {
      const nextPage = this.data.currentPage + 1;
      this.getComments(this.data.productNum, nextPage, this.data.currentFilter);
    }
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
  
  // 处理导航栏返回按钮点击
  handleNavBack() {
    wx.navigateBack({
      delta: 1
    });
  }
})
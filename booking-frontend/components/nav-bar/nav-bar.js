Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    // 文字颜色, white或black
    textStyle: {
      type: String,
      value: 'white'
    },
    // 左侧功能按钮类型: back(返回), home(首页), search(搜索), none(无)
    leftButtonType: {
      type: String,
      value: 'back'
    },
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      value: false
    },
    // 搜索框占位文本
    searchPlaceholder: {
      type: String,
      value: '搜索'
    },
    // 滚动渐变的触发距离
    scrollTrigger: {
      type: Number,
      value: 100
    }
  },
  
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    totalHeight: 0,
    searchValue: '',
    showSearchInput: false,
    opacity: 0, // 导航栏背景透明度，初始为0（完全透明）
    navBgColor: 'transparent' // 导航栏背景颜色
  },
  
  lifetimes: {
    attached() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      const navBarHeight = 44; // 导航条的高度
      const totalHeight = systemInfo.statusBarHeight + navBarHeight;
      
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight,
        navBarHeight: navBarHeight,
        totalHeight: totalHeight
      });
      
      // 设置页面容器的padding-top，防止内容被导航栏遮挡
      wx.nextTick(() => {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        if (currentPage) {
          const pageContainers = currentPage.selectAllComponents('.container');
          if (pageContainers && pageContainers.length > 0) {
            pageContainers.forEach(container => {
              container.setStyle({
                paddingTop: totalHeight + 'px'
              });
            });
          }
        }
      });
      
      // 设置页面滚动监听
      this.setupScrollListener();
    },
    
    detached() {
      // 移除页面滚动监听
      wx.nextTick(() => {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        if (currentPage) {
          // 移除滚动监听
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
          });
        }
      });
    }
  },
  
  methods: {
    // 设置页面滚动监听
    setupScrollListener() {
      // 获取当前页面
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage) {
        // 为当前页面的onPageScroll方法添加监听
        const originalOnPageScroll = currentPage.onPageScroll || function() {};
        
        currentPage.onPageScroll = (e) => {
          // 执行原有的onPageScroll
          originalOnPageScroll.call(currentPage, e);
          
          // 自定义滚动处理逻辑
          this.handlePageScroll(e);
        };
      }
    },
    
    // 处理页面滚动
    handlePageScroll(e) {
      const { scrollTop } = e;
      const { scrollTrigger } = this.properties;
      
      // 计算导航栏透明度，随着滚动逐渐增加
      let opacity = scrollTop / scrollTrigger;
      if (opacity > 1) opacity = 1;
      if (opacity < 0) opacity = 0;
      
      // 使用统一的米白色背景 #F7E8AA
      const bgColor = `rgba(247, 232, 170, ${opacity})`;
      
      this.setData({
        opacity,
        navBgColor: bgColor
      });
    },
    
    // 返回上一页
    navBack() {
      wx.navigateBack({
        delta: 1,
        fail() {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    },
    
    // 返回首页
    navHome() {
      wx.switchTab({
        url: '/pages/index/index'
      });
    },
    
    // 处理左侧按钮点击
    handleLeftButtonTap() {
      const { leftButtonType } = this.data;
      
      switch (leftButtonType) {
        case 'back':
          this.navBack();
          break;
        case 'home':
          this.navHome();
          break;
        case 'search':
          this.toggleSearchInput();
          break;
        default:
          break;
      }
    },
    
    // 切换搜索输入框显示状态
    toggleSearchInput() {
      const { showSearchInput } = this.data;
      this.setData({
        showSearchInput: !showSearchInput
      });
    },
    
    // 搜索输入变化
    onSearchInput(e) {
      this.setData({
        searchValue: e.detail.value
      });
    },
    
    // 执行搜索
    doSearch() {
      const { searchValue } = this.data;
      this.triggerEvent('search', { value: searchValue });
    },
    
    // 搜索确认
    onSearchConfirm(e) {
      this.triggerEvent('search', { value: e.detail.value });
    }
  }
}) 
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
    },
    // 是否启用渐变效果（只在首页开启）
    enableGradient: {
      type: Boolean,
      value: false
    },
    // 是否使用固定背景色
    useFixedBg: {
      type: Boolean,
      value: true
    },
    // 固定背景色值
    fixedBgColor: {
      type: String,
      value: '#F7E8AA'
    }
  },
  
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    totalHeight: 0,
    searchValue: '',
    showSearchInput: false,
    opacity: 0, // 导航栏背景透明度，初始为0（完全透明）
    navBgColor: 'transparent', // 导航栏背景颜色
    lastScrollTime: 0, // 上次滚动时间，用于节流
    scrollThrottleDelay: 100 // 节流间隔，毫秒
  },
  
  lifetimes: {
    attached() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      const navBarHeight = 44; // 导航条的高度
      const totalHeight = systemInfo.statusBarHeight + navBarHeight;
      
      // 设置初始背景色
      let initialBgColor = 'transparent';
      if (this.properties.useFixedBg) {
        initialBgColor = this.properties.fixedBgColor;
      }
      
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight,
        navBarHeight: navBarHeight,
        totalHeight: totalHeight,
        navBgColor: initialBgColor // 根据属性设置初始化背景色
      });
      
      // 设置CSS变量，以便其他组件可以使用
      wx.nextTick(() => {
        // 通过设置CSS变量到页面的根元素
        this.setCssVariable('--nav-bar-height', totalHeight + 'px');
      });
      
      // 仅当启用渐变效果时才设置滚动监听
      if (this.properties.enableGradient) {
        this.setupScrollListener();
      }
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
    // 设置CSS变量的辅助方法
    setCssVariable(name, value) {
      try {
        // 获取所有页面，更新每个页面的样式变量
        const pages = getCurrentPages();
        if (pages && pages.length > 0) {
          const page = pages[pages.length - 1];
          
          // 使用微信小程序提供的方法设置CSS变量
          wx.createSelectorQuery()
            .selectViewport()
            .fields({ node: true }, (res) => {
              if (res && res.node) {
                res.node.style.setProperty(name, value);
              }
            })
            .exec();
          
          // 通过setData方式设置，确保所有组件能够获取到
          const data = {};
          data[name.replace('--', '')] = value;
          page.setData(data);
        }
      } catch (e) {
        console.error('设置CSS变量失败', e);
      }
    },
    
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
          
          // 节流处理
          this.throttlePageScroll(e);
        };
      }
    },
    
    // 节流处理页面滚动
    throttlePageScroll(e) {
      const now = Date.now();
      const { lastScrollTime, scrollThrottleDelay } = this.data;
      
      // 如果距离上次处理的时间小于节流间隔，则不处理
      if (now - lastScrollTime < scrollThrottleDelay) {
        return;
      }
      
      // 更新最后处理时间
      this.setData({
        lastScrollTime: now
      });
      
      // 处理滚动事件
      this.handlePageScroll(e);
    },
    
    // 处理页面滚动
    handlePageScroll(e) {
      // 如果不启用渐变效果，则不执行后续逻辑
      if (!this.properties.enableGradient) {
        return;
      }
      
      const { scrollTop } = e;
      const { scrollTrigger } = this.properties;
      
      // 计算导航栏透明度，随着滚动逐渐增加
      let opacity = scrollTop / scrollTrigger;
      if (opacity > 1) opacity = 1;
      if (opacity < 0) opacity = 0;
      
      // 使用统一的米白色背景 #F7E8AA
      const bgColor = opacity > 0 ? `rgba(247, 232, 170, ${opacity})` : 'transparent';
      
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
      const { leftButtonType } = this.properties;
      
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
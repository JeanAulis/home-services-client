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
    // 滚动渐变的触发距离 - 已不再使用，保留属性兼容性
    scrollTrigger: {
      type: Number,
      value: 100
    },
    // 是否启用渐变效果 - 已不再使用，统一禁用渐变
    enableGradient: {
      type: Boolean,
      value: false
    },
    // 是否使用固定背景色 - 已不再使用，统一使用固定背景
    useFixedBg: {
      type: Boolean,
      value: true
    },
    // 固定背景色值 - 已统一设置为#f7e8aa
    fixedBgColor: {
      type: String,
      value: '#f7e8aa'
    }
  },
  
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    totalHeight: 0,
    searchValue: '',
    showSearchInput: false,
    opacity: 1, // 导航栏背景透明度，固定为1（完全不透明）
    navBgColor: '#f7e8aa', // 导航栏背景颜色，统一为#f7e8aa
  },
  
  lifetimes: {
    attached() {
      // 获取系统信息 - 使用新的推荐API
      try {
        // 使用新API获取状态栏高度
        const systemInfo = wx.getWindowInfo();
        const navBarHeight = 44; // 导航条的高度
        const totalHeight = systemInfo.statusBarHeight + navBarHeight;
        
        this.setData({
          statusBarHeight: systemInfo.statusBarHeight,
          navBarHeight: navBarHeight,
          totalHeight: totalHeight,
          navBgColor: '#f7e8aa' // 统一设置为#f7e8aa
        });
        
        // 设置CSS变量，以便其他组件可以使用
        wx.nextTick(() => {
          // 通过设置CSS变量到页面的根元素
          this.setCssVariable('--nav-bar-height', totalHeight + 'px');
        });
      } catch (error) {
        console.error('获取系统信息失败:', error);
        // 使用兜底方案
        wx.getSystemInfo({
          success: (res) => {
            const navBarHeight = 44;
            const totalHeight = res.statusBarHeight + navBarHeight;
            
            this.setData({
              statusBarHeight: res.statusBarHeight,
              navBarHeight: navBarHeight,
              totalHeight: totalHeight,
              navBgColor: '#f7e8aa'
            });
            
            wx.nextTick(() => {
              this.setCssVariable('--nav-bar-height', totalHeight + 'px');
            });
          }
        });
      }
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
      if (this.properties.leftButtonType === 'back') {
        this.navBack();
      } else if (this.properties.leftButtonType === 'home') {
        this.navHome();
      } else if (this.properties.leftButtonType === 'search') {
        this.toggleSearchInput();
      }
      
      this.triggerEvent('back');
    },
    
    // 切换搜索输入框
    toggleSearchInput() {
      this.setData({
        showSearchInput: !this.data.showSearchInput
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
      this.triggerEvent('search', { value: this.data.searchValue });
    },
    
    // 搜索确认
    onSearchConfirm(e) {
      this.triggerEvent('search', { value: e.detail.value });
    }
  }
}) 
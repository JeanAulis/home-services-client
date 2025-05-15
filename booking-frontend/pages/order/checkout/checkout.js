const app = getApp();
const util = require('../../../utils/util.js');

Page({
  data: {
    loading: true,
    serviceDetail: null,
    serviceId: null,
    selectedAddress: null,
    // 时间选择弹出层相关数据
    showTimePopup: false,
    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    maxDate: new Date(new Date().setDate(new Date().getDate() + 14)).getTime(), // 最多可预约14天后
    selectedTime: null,
    formattedTime: '',
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      if (type === 'day') {
        return `${value}日`;
      }
      if (type === 'hour') {
        return `${value}点`;
      }
      if (type === 'minute') {
        return `${value}分`;
      }
      return value;
    },
    // 时间选择选项卡
    currentTab: 'date',
    // 时间段选择
    timeSlots: [],
    selectedTimeSlot: -1,
    selectedDate: null,
    selectedCoupon: null,
    coupons: [],
    remarks: '',
    totalAmount: 0
  },

  onLoad: function(options) {
    // 获取服务ID
    if (options.serviceId) {
      this.setData({
        serviceId: options.serviceId
      });
      this.loadServiceDetail(options.serviceId);
    }
    
    // 获取用户地址
    this.loadUserAddresses();
    
    // 获取用户优惠券
    this.loadUserCoupons();
  },
  
  onShow: function() {
    // 页面显示时可能需要刷新地址或者优惠券信息
    if (this.data.selectedAddress === null) {
      this.loadDefaultAddress();
    }
  },
  
  // 加载服务详情
  loadServiceDetail: function(serviceId) {
    wx.showLoading({
      title: '加载中',
    });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/products/${serviceId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const serviceDetail = res.data;
          this.setData({
            serviceDetail: serviceDetail,
            loading: false,
            totalAmount: serviceDetail.price
          });
          this.calculateTotal();
        } else {
          wx.showToast({
            title: '获取服务详情失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取服务详情失败', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  // 加载用户地址
  loadUserAddresses: function() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/addresses`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.length > 0) {
          // 设置默认地址
          this.loadDefaultAddress();
        }
      },
      fail: (err) => {
        console.error('获取地址列表失败', err);
      }
    });
  },
  
  // 加载默认地址
  loadDefaultAddress: function() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/addresses/default`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({
            selectedAddress: res.data
          });
        }
      }
    });
  },
  
  // 加载用户优惠券
  loadUserCoupons: function() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/user/coupons/available`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            coupons: res.data
          });
        }
      },
      fail: (err) => {
        console.error('获取优惠券失败', err);
      }
    });
  },
  
  // 选择地址
  selectAddress: function() {
    wx.navigateTo({
      url: '/pages/user/address/address?from=checkout',
    });
  },
  
  // 显示时间选择弹出层
  showTimePicker: function() {
    // 初始化为日期选择选项卡
    this.setData({
      showTimePopup: true,
      currentTab: 'date',
      selectedTimeSlot: -1
    });
  },
  
  // 关闭时间选择弹出层
  onTimePopupClose: function() {
    this.setData({
      showTimePopup: false
    });
  },
  
  // 切换到日期选项卡
  switchToDateTab: function() {
    this.setData({
      currentTab: 'date'
    });
  },
  
  // 切换到时间选项卡
  switchToTimeTab: function() {
    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请先选择日期',
        icon: 'none'
      });
      return;
    }
    
    // 生成时间段选项
    this.generateTimeSlots();
    
    this.setData({
      currentTab: 'time'
    });
  },
  
  // 日期选择输入变化
  onDateInput: function(e) {
    const date = new Date(e.detail);
    
    // 保存选择的日期
    this.setData({
      currentDate: e.detail,
      selectedDate: date
    });
  },
  
  // 生成时间段选项
  generateTimeSlots: function() {
    const slots = [];
    const now = new Date();
    const selectedDate = this.data.selectedDate;
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    // 生成8:00-20:00的时间段，每半小时一个时间段
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute of [0, 30]) {
        // 如果是今天，需要禁用已过去的时间
        let disabled = false;
        if (isToday) {
          if (hour < now.getHours() || (hour === now.getHours() && minute < now.getMinutes())) {
            disabled = true;
          }
        }
        
        // 将小时和分钟格式化为两位数
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        
        slots.push({
          text: `${formattedHour}:${formattedMinute}`,
          hour: hour,
          minute: minute,
          disabled: disabled
        });
      }
    }
    
    this.setData({
      timeSlots: slots
    });
  },
  
  // 选择时间段
  selectTimeSlot: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedTimeSlot: index
    });
  },
  
  // 取消时间选择
  cancelTimePicker: function() {
    this.setData({
      showTimePopup: false
    });
  },
  
  // 确认时间选择
  confirmTimePicker: function() {
    // 检查是否选择了日期和时间
    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.currentTab === 'time' && this.data.selectedTimeSlot === -1) {
      wx.showToast({
        title: '请选择时间段',
        icon: 'none'
      });
      return;
    }
    
    // 根据当前选项卡确定选择的时间
    let selectedTime;
    let formattedTime;
    
    if (this.data.currentTab === 'date') {
      // 如果只选择了日期，默认时间为当天8:00
      selectedTime = new Date(this.data.selectedDate);
      selectedTime.setHours(8, 0, 0, 0);
      
      const month = selectedTime.getMonth() + 1;
      const day = selectedTime.getDate();
      const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][selectedTime.getDay()];
      formattedTime = `${month}月${day}日 ${weekday} 08:00`;
    } else {
      // 如果选择了具体时间段
      const timeSlot = this.data.timeSlots[this.data.selectedTimeSlot];
      selectedTime = new Date(this.data.selectedDate);
      selectedTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
      
      const month = selectedTime.getMonth() + 1;
      const day = selectedTime.getDate();
      const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][selectedTime.getDay()];
      formattedTime = `${month}月${day}日 ${weekday} ${timeSlot.text}`;
    }
    
    this.setData({
      selectedTime: selectedTime,
      formattedTime: formattedTime,
      showTimePopup: false
    });
  },
  
  // 选择优惠券
  selectCoupon: function() {
    if (this.data.coupons.length === 0) {
      wx.showToast({
        title: '暂无可用优惠券',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/user/coupon/coupon?from=checkout',
    });
  },
  
  // 备注内容变更
  onRemarkChange: function(e) {
    this.setData({
      remarks: e.detail
    });
  },
  
  // 计算总金额
  calculateTotal: function() {
    let total = this.data.serviceDetail ? this.data.serviceDetail.price : 0;
    
    if (this.data.selectedCoupon) {
      total = Math.max(0.01, total - this.data.selectedCoupon.amount);
    }
    
    this.setData({
      totalAmount: parseFloat(total.toFixed(2))
    });
  },
  
  // 提交订单
  submitOrder: function() {
    // 检查必填项
    if (!this.data.selectedAddress) {
      wx.showToast({
        title: '请选择服务地址',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.selectedTime) {
      wx.showToast({
        title: '请选择服务时间',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '提交中',
    });
    
    const serviceTime = this.data.selectedTime;
    
    // 构建订单对象
    const order = {
      userNum: wx.getStorageSync('userInfo').userNum,
      serviceName: this.data.serviceDetail.productName,
      orderAmount: this.data.totalAmount,
      serviceTime: serviceTime.toISOString(),
      addressId: this.data.selectedAddress.id,
      contactName: this.data.selectedAddress.name,
      contactPhone: this.data.selectedAddress.phone,
      couponId: this.data.selectedCoupon ? this.data.selectedCoupon.id : null,
      remarks: this.data.remarks
    };
    
    // 调用创建订单API
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/orders/create`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: order,
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const orderId = res.data.orderId;
          
          // 跳转到支付页面
          wx.navigateTo({
            url: `/pages/order/payment/payment?orderId=${orderId}&amount=${this.data.totalAmount}`,
          });
        } else {
          wx.showToast({
            title: res.data.message || '创建订单失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('创建订单失败', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  // 处理导航栏返回
  handleNavBack: function() {
    wx.navigateBack();
  }
}); 
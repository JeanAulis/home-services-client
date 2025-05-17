const app = getApp();
const util = require('../../../utils/util.js');
const apiBaseUrl = 'http://localhost:8080'; // 设置API基础URL，根据实际情况修改

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
		// maxDate: new Date(new Date().setDate(new Date().getDate() + 14)).getTime(), // 最多可预约14天后
		maxDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).getTime(), // 最多可预约3个月后
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
		totalAmount: 0,
		hasAvailableTimeSlots: false
	},

	onLoad: function (options) {
		// 获取服务ID
		if (options.serviceId) {
			this.setData({
				serviceId: options.serviceId
			});
			this.loadServiceDetail(options.serviceId);
		}

		// 检查用户是否登录
		const userInfo = wx.getStorageSync('userInfo');
		if (userInfo && userInfo.userNum) {
			// 直接加载默认地址
			this.loadDefaultAddress();

			// 获取用户优惠券
			this.loadUserCoupons();
		} else {
			// 如果没有登录，提示用户需要登录
			wx.showModal({
				title: '提示',
				content: '请先登录以继续操作',
				confirmText: '去登录',
				success: (res) => {
					if (res.confirm) {
						wx.navigateTo({
							url: '/pages/login/login'
						});
					} else {
						wx.navigateBack();
					}
				}
			});
		}
	},

	onShow: function () {
		// 如果页面从地址选择页面返回，可能不需要重新获取默认地址
		// 但如果没有选择任何地址，则尝试加载默认地址
		if (this.data.selectedAddress === null) {
			this.loadDefaultAddress();
		}
	},

	// 加载服务详情
	loadServiceDetail: function (serviceId) {
		wx.showLoading({
			title: '加载中',
		});

		wx.request({
			url: `${apiBaseUrl}/api/product/detail`,
			method: 'GET',
			data: {
				productNum: serviceId
			},
			success: (res) => {
				if (res.statusCode === 200 && res.data.code === 200) {
					const serviceDetail = res.data.data.product;
					const statistics = res.data.data.statistics;

					// 处理服务数据，确保字段一致性
					const processedDetail = {
						...serviceDetail,
						name: serviceDetail.productName || serviceDetail.name || '未知服务',
						image: serviceDetail.productImages ? serviceDetail.productImages.split(',')[0] : null,
						price: serviceDetail.price || 0
					};

					this.setData({
						serviceDetail: processedDetail,
						loading: false,
						totalAmount: processedDetail.price
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

	// 加载默认地址
	loadDefaultAddress: function () {
		// 确保用户已登录
		const userInfo = wx.getStorageSync('userInfo');
		if (!userInfo || !userInfo.userNum) return;

		wx.request({
			url: `${apiBaseUrl}/api/address/default`,
			method: 'GET',
			data: {
				userNum: userInfo.userNum
			},
			header: {
				'Authorization': `Bearer ${wx.getStorageSync('token')}`
			},
			success: (res) => {
				if (res.statusCode === 200 && res.data.code === 200 && res.data.data) {
					this.setData({
						selectedAddress: res.data.data
					});
				} else if (res.data.code === 404) {
					// 未设置默认地址，可以尝试获取地址列表中的第一个地址
					this.loadFirstAddress();
				}
			},
			fail: (err) => {
				console.error('获取默认地址失败', err);
			}
		});
	},

	// 如果没有默认地址，尝试加载地址列表中的第一个地址
	loadFirstAddress: function () {
		// 确保用户已登录
		const userInfo = wx.getStorageSync('userInfo');
		if (!userInfo || !userInfo.userNum) return;

		wx.request({
			url: `${apiBaseUrl}/api/address/list`,
			method: 'GET',
			data: {
				userNum: userInfo.userNum
			},
			header: {
				'Authorization': `Bearer ${wx.getStorageSync('token')}`
			},
			success: (res) => {
				if (res.statusCode === 200 && res.data.code === 200 && res.data.data && res.data.data.length > 0) {
					this.setData({
						selectedAddress: res.data.data[0]
					});
				}
			},
			fail: (err) => {
				console.error('获取地址列表失败', err);
			}
		});
	},

	// 加载用户优惠券
	loadUserCoupons: function () {
		// 确保用户已登录
		const userInfo = wx.getStorageSync('userInfo');
		if (!userInfo || !userInfo.userNum) return;

		wx.request({
			url: `${apiBaseUrl}/api/asset/coupons`,
			method: 'GET',
			data: {
				userNum: userInfo.userNum
			},
			header: {
				'Authorization': `Bearer ${wx.getStorageSync('token')}`
			},
			success: (res) => {
				if (res.statusCode === 200 && res.data.code === 200) {
					this.setData({
						coupons: res.data.data
					});
				}
			},
			fail: (err) => {
				console.error('获取优惠券失败', err);
			}
		});
	},

	// 选择地址
	selectAddress: function () {
		wx.navigateTo({
			url: '/pages/user/address/address?from=checkout',
		});
	},

	// 显示时间选择弹出层
	showTimePicker: function () {
		// 如果已经选择了日期，则检查是否有可用时间段
		if (this.data.selectedDate) {
			this.generateTimeSlots();
		}

		// 初始化为日期选择选项卡
		this.setData({
			showTimePopup: true,
			currentTab: 'date',
			selectedTimeSlot: -1
		});
	},

	// 关闭时间选择弹出层
	onTimePopupClose: function () {
		this.setData({
			showTimePopup: false
		});
	},

	// 切换到日期选项卡
	switchToDateTab: function () {
		this.setData({
			currentTab: 'date'
		});
	},

	// 切换到时间选项卡
	switchToTimeTab: function () {
		if (!this.data.selectedDate) {
			wx.showToast({
				title: '请先选择日期',
				icon: 'none'
			});
			return;
		}

		// 生成时间段选项并获取是否有可用时间段
		const hasAvailableSlots = this.generateTimeSlots();

		// 如果没有可用时间段，提示用户
		if (!hasAvailableSlots) {
			wx.showToast({
				title: '当前日期没有可预约时间段，请选择其他日期',
				icon: 'none',
				duration: 2000
			});
			return;
		}

		this.setData({
			currentTab: 'time'
		});
	},

	// 日期选择输入变化
	onDateInput: function (e) {
		const date = new Date(e.detail);

		// 保存选择的日期
		this.setData({
			currentDate: e.detail,
			selectedDate: date,
			// 重置时间段选择
			selectedTimeSlot: -1
		});

		// 检查是否有可用时间段
		// 预先生成时间段，但不切换到时间选项卡
		const hasAvailableSlots = this.generateTimeSlots();

		// 如果没有可用时间段，提示用户
		if (!hasAvailableSlots) {
			wx.showToast({
				title: '当前日期没有可预约时间段，请选择其他日期',
				icon: 'none',
				duration: 2000
			});
		}
	},

	// 生成时间段选项
	generateTimeSlots: function () {
		const slots = [];
		const now = new Date();
		const selectedDate = this.data.selectedDate;
		// const isToday = selectedDate.toDateString() === now.toDateString(); // 未被用到

		// 最早预约时间为当前时间+4小时
		const minBookingTime = new Date(now.getTime());
		minBookingTime.setHours(minBookingTime.getHours() + 4);

		// 是否有可用时间段的标志
		let hasAvailableSlots = false;

		// 生成8:00-20:00的时间段，每半小时一个时间段
		for (let hour = 8; hour <= 20; hour++) {
			for (let minute of [0, 30]) {
				// 创建时间对象用于比较
				const slotTime = new Date(selectedDate);
				slotTime.setHours(hour, minute, 0, 0);

				// 判断该时间段是否可选
				let disabled = false;

				// 如果时间段早于最早预约时间，则禁用
				if (slotTime < minBookingTime) {
					disabled = true;
				}

				// 将小时和分钟格式化为两位数
				const formattedHour = hour.toString().padStart(2, '0');
				const formattedMinute = minute.toString().padStart(2, '0');

				// 如果有可用时间段，更新标志
				if (!disabled) {
					hasAvailableSlots = true;
				}

				slots.push({
					text: `${formattedHour}:${formattedMinute}`,
					hour: hour,
					minute: minute,
					disabled: disabled,
					time: slotTime
				});
			}
		}

		this.setData({
			timeSlots: slots,
			hasAvailableTimeSlots: hasAvailableSlots
		});

		return hasAvailableSlots;
	},

	// 选择时间段
	selectTimeSlot: function (e) {
		const index = e.currentTarget.dataset.index;
		this.setData({
			selectedTimeSlot: index
		});
	},

	// 取消时间选择
	cancelTimePicker: function () {
		this.setData({
			showTimePopup: false
		});
	},

	// 确认时间选择
	confirmTimePicker: function () {
		// 检查是否选择了日期
		if (!this.data.selectedDate) {
			wx.showToast({
				title: '请选择日期',
				icon: 'none'
			});
			return;
		}

		// 根据当前选项卡确定选择的时间
		let selectedTime;
		let formattedTime;

		if (this.data.currentTab === 'date') {
			// 如果只选择了日期，获取当天第一个可用时间段
			if (!this.data.hasAvailableTimeSlots) {
				wx.showToast({
					title: '当前日期没有可预约时间段，请选择其他日期',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			// 找到第一个未禁用的时间段
			const availableSlot = this.data.timeSlots.find(slot => !slot.disabled);
			if (!availableSlot) {
				wx.showToast({
					title: '当前日期没有可预约时间段，请选择其他日期',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			selectedTime = new Date(availableSlot.time);

			const month = selectedTime.getMonth() + 1;
			const day = selectedTime.getDate();
			const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][selectedTime.getDay()];
			formattedTime = `${month}月${day}日 ${weekday} ${availableSlot.text}`;
		} else {
			// 如果选择了具体时间段，但未选择具体时间
			if (this.data.selectedTimeSlot === -1) {
				// 找到第一个未禁用的时间段
				const firstAvailableIndex = this.data.timeSlots.findIndex(slot => !slot.disabled);
				if (firstAvailableIndex === -1) {
					wx.showToast({
						title: '当前日期没有可预约时间段，请选择其他日期',
						icon: 'none',
						duration: 2000
					});
					return;
				}

				// 自动选择第一个可用时间段
				this.setData({
					selectedTimeSlot: firstAvailableIndex
				});
			}

			// 获取选择的时间段
			const timeSlot = this.data.timeSlots[this.data.selectedTimeSlot];

			// 检查选择的时间段是否可用
			if (timeSlot.disabled) {
				wx.showToast({
					title: '所选时间段不可用，请重新选择',
					icon: 'none',
					duration: 2000
				});
				return;
			}

			selectedTime = new Date(timeSlot.time);

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
	selectCoupon: function () {
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
	onRemarkChange: function (e) {
		this.setData({
			remarks: e.detail
		});
	},

	// 计算总金额
	calculateTotal: function () {
		let total = this.data.serviceDetail ? this.data.serviceDetail.price : 0;

		if (this.data.selectedCoupon) {
			total = Math.max(0.01, total - this.data.selectedCoupon.amount);
		}

		this.setData({
			totalAmount: parseFloat(total.toFixed(2))
		});
	},

	// 提交订单
	submitOrder: function () {
		// 检查用户是否登录
		const userInfo = wx.getStorageSync('userInfo');
		if (!userInfo || !userInfo.userNum) {
			wx.showModal({
				title: '提示',
				content: '请先登录以继续操作',
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

		// 再次核验时间是否符合要求（当前时间+4小时之后）
		const now = new Date();
		const minBookingTime = new Date(now.getTime());
		console.log("当前时间为", now.toLocaleString());
		console.log("当前小时为", minBookingTime.getHours());
		minBookingTime.setHours(minBookingTime.getHours() + 4);
		console.log("最小预约时间为", minBookingTime.toLocaleString());
		const selectedTime = new Date(this.data.selectedTime);
		console.log("选择的时间为", selectedTime.toLocaleString());

		// 前端不做最小时间验证，全部放到后端处理，避免时区问题

		// 检查地址信息完整性
		const address = this.data.selectedAddress;
		if (!address.receiverName && !address.name) {
			wx.showToast({
				title: '地址联系人信息不完整',
				icon: 'none'
			});
			return;
		}

		if (!address.phone) {
			wx.showToast({
				title: '地址联系电话不完整',
				icon: 'none'
			});
			return;
		}

		wx.showLoading({
			title: '提交中',
		});

		const serviceTime = this.data.selectedTime;
		const addressObj = this.data.selectedAddress;

		// 获取当前选择的年月日时分
		const selectYear = serviceTime.getFullYear();
		const selectMonth = serviceTime.getMonth();
		const selectDate = serviceTime.getDate();
		const selectHours = serviceTime.getHours();
		const selectMinutes = serviceTime.getMinutes();

		// 获取本地时区偏移量（分钟）
		const timezoneOffset = new Date().getTimezoneOffset();
		console.log('本地时区偏移量(分钟):', timezoneOffset);

		// 创建新的日期对象，确保使用系统当前时间的时区设置
		const formattedServiceTime = new Date();
		formattedServiceTime.setFullYear(selectYear);
		formattedServiceTime.setMonth(selectMonth);
		formattedServiceTime.setDate(selectDate);
		formattedServiceTime.setHours(selectHours);
		formattedServiceTime.setMinutes(selectMinutes);
		formattedServiceTime.setSeconds(0);
		formattedServiceTime.setMilliseconds(0);

		// 转换为ISO字符串
		const serviceTimeStr = formattedServiceTime.toISOString();
		console.log('提交服务时间:', serviceTimeStr);

		// 构建预约时间描述，更方便后端解析
		const serviceTimeDesc = {
			year: selectYear,
			month: selectMonth + 1, // 月份从0开始，需要+1
			date: selectDate,
			hours: selectHours,
			minutes: selectMinutes,
			timezoneOffset: timezoneOffset,
			formattedTime: `${selectYear}-${(selectMonth + 1).toString().padStart(2, '0')}-${selectDate.toString().padStart(2, '0')} ${selectHours.toString().padStart(2, '0')}:${selectMinutes.toString().padStart(2, '0')}:00`
		};

		// 构建订单对象
		const order = {
			userNum: userInfo.userNum,
			productNum: this.data.serviceId,
			serviceName: this.data.serviceDetail.name,
			orderAmount: this.data.totalAmount,
			serviceTime: serviceTimeStr,
			serviceTimeDesc: serviceTimeDesc, // 添加额外的时间描述
			addressId: addressObj.id,
			contactName: addressObj.receiverName || addressObj.name,
			contactPhone: addressObj.phone,
			couponId: this.data.selectedCoupon ? this.data.selectedCoupon.id : null,
			remarks: this.data.remarks
		};

		console.log('提交订单数据:', order);

		// 调用创建订单API
		wx.request({
			url: `${apiBaseUrl}/api/order/create`,
			method: 'POST',
			header: {
				'Authorization': `Bearer ${wx.getStorageSync('token')}`,
				'Content-Type': 'application/json'
			},
			data: order,
			success: (res) => {
				console.log('订单创建响应:', res.data);
				if (res.statusCode === 200 && res.data.code === 200) {
					const orderId = res.data.data.orderId;

					// 跳转到支付页面
					wx.navigateTo({
						url: `/pages/order/payment/payment?orderId=${orderId}&amount=${this.data.totalAmount}`,
					});

					wx.showToast({
						title: '订单创建成功',
						icon: 'success',
						duration: 2000,
						success: () => {
							// 延迟跳转到订单列表页面
							setTimeout(() => {
								wx.switchTab({
									url: '/pages/order/order'
								});
							}, 100);
						}
					});

				} else {
					wx.showToast({
						title: res.data.msg || '创建订单失败',
						icon: 'none',
						duration: 3000
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
	handleNavBack: function () {
		wx.navigateBack();
	}
});
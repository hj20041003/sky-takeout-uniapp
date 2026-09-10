if (typeof uni === 'undefined') { var uni = wx; }

var BASE_URL = 'http://localhost:8080';

function getHeader() {
  try {
    var app = getApp();
    if (app && app.$vm && app.$vm.$store && app.$vm.$store.state.token) {
      return { 'authentication': app.$vm.$store.state.token };
    }
  } catch (e) {}
  var token = '';
  try { token = uni.getStorageSync('token') || ''; } catch (e) {}
  return token ? { 'authentication': token } : {};
}

function discountOf(amount, coupon) {
  var pay;
  if (coupon.type === 2) {
    pay = amount * coupon.discountAmount / 100;
  } else {
    pay = amount - coupon.discountAmount;
  }
  var d = Math.round((amount - pay) * 100) / 100;
  return d > 0 ? d : 0;
}

Page({
  data: {
    amount: 0,
    list: [],
    loading: true
  },

  onLoad: function (options) {
    this.amount = Number(options.amount || 0);
    this.setData({ amount: this.amount });
  },

  onShow: function () {
    this.loadList();
  },

  loadList: function () {
    var that = this;
    that.setData({ loading: true });
    uni.request({
      url: BASE_URL + '/user/coupon/available',
      method: 'GET',
      data: { amount: that.amount },
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1) {
          var list = (res.data.data || []).map(function (item) {
            item.discount = discountOf(that.amount, item);
            return item;
          });
          that.setData({ list: list });
        } else {
          uni.showToast({ title: (res.data && res.data.msg) || '加载失败', icon: 'none' });
        }
      },
      fail: function () {
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
      },
      complete: function () {
        that.setData({ loading: false });
      }
    });
  },

  onPick: function (e) {
    var id = e.currentTarget.dataset.id;
    var discount = 0;
    var list = (this.data && this.data.list) || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) { discount = list[i].discount || 0; break; }
    }
    try {
      uni.setStorageSync('couponPicked', 1);
      uni.setStorageSync('selectedCouponId', id);
      uni.setStorageSync('selectedCouponDiscount', discount);
    } catch (err) {}
    uni.navigateBack();
  },

  onNoCoupon: function () {
    try {
      uni.setStorageSync('couponPicked', 1);
      uni.setStorageSync('selectedCouponId', 0);
      uni.setStorageSync('selectedCouponDiscount', 0);
    } catch (err) {}
    uni.navigateBack();
  }
});

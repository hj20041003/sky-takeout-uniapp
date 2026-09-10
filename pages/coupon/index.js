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

Page({
  data: {
    list: [],
    loading: true,
    receivedMap: {}
  },

  onShow: function () {
    this.loadList();
  },

  loadList: function () {
    var that = this;
    that.setData({ loading: true });
    uni.request({
      url: BASE_URL + '/user/coupon/list',
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1) {
          that.setData({ list: res.data.data || [] });
          that.loadMine();
        } else {
          that.setData({ loading: false });
          uni.showToast({ title: (res.data && res.data.msg) || '加载失败', icon: 'none' });
        }
      },
      fail: function () {
        that.setData({ loading: false });
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
      }
    });
  },

  loadMine: function () {
    var that = this;
    uni.request({
      url: BASE_URL + '/user/coupon/my',
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        var map = {};
        if (res.data && res.data.code === 1) {
          (res.data.data || []).forEach(function (item) {
            map[item.couponId] = true;
          });
        }
        that.setData({ receivedMap: map, loading: false });
      },
      fail: function () {
        that.setData({ loading: false });
      }
    });
  },

  goMyCoupon: function () {
    uni.navigateTo({ url: '/pages/myCoupon/index' });
  },

  onReceive: function (e) {
    var couponId = e.currentTarget.dataset.id;
    var that = this;
    uni.request({
      url: BASE_URL + '/user/coupon/receive/' + couponId,
      method: 'POST',
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1) {
          uni.showToast({ title: '领取成功', icon: 'success' });
          var map = that.data.receivedMap;
          map[couponId] = true;
          that.setData({ receivedMap: map });
        } else {
          uni.showToast({ title: (res.data && res.data.msg) || '领取失败', icon: 'none' });
        }
      },
      fail: function () {
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  }
});

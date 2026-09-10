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

var TABS = [
  { status: 1, label: '未使用' },
  { status: 2, label: '已使用' },
  { status: 3, label: '已过期' }
];

Page({
  data: {
    tabs: TABS,
    currentStatus: 1,
    list: [],
    loading: true
  },

  onShow: function () {
    this.loadList();
  },

  switchTab: function (e) {
    var status = Number(e.currentTarget.dataset.status);
    if (status === this.data.currentStatus) return;
    this.setData({ currentStatus: status, loading: true });
    this.loadList();
  },

  goCoupon: function () {
    uni.navigateTo({ url: '/pages/coupon/index' });
  },

  loadList: function () {
    var that = this;
    that.setData({ loading: true });
    uni.request({
      url: BASE_URL + '/user/coupon/my',
      method: 'GET',
      data: { status: that.data.currentStatus },
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1) {
          that.setData({ list: res.data.data || [] });
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
  }
});

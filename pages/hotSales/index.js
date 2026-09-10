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
    loading: true
  },

  onShow: function () {
    this.loadList();
  },

  loadList: function () {
    var that = this;
    that.setData({ loading: true });
    uni.request({
      url: BASE_URL + '/user/dish/hot',
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1) {
          that.setData({ list: res.data.data || [], loading: false });
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

  goSearch: function () {
    uni.navigateTo({ url: '/pages/search/index' });
  }
});

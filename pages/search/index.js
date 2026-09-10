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
    keyword: '',
    list: [],
    searched: false,
    loading: false
  },

  onInput: function (e) {
    this.setData({ keyword: e.detail.value });
  },

  doSearch: function () {
    var kw = (this.data.keyword || '').trim();
    if (!kw) {
      uni.showToast({ title: '请输入菜品名称', icon: 'none' });
      return;
    }
    this.search(kw);
  },

  search: function (kw) {
    var that = this;
    that.setData({ loading: true });
    uni.request({
      url: BASE_URL + '/user/dish/search?name=' + encodeURIComponent(kw),
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1) {
          that.setData({ list: res.data.data || [], searched: true, loading: false });
        } else {
          that.setData({ loading: false, searched: true, list: [] });
          uni.showToast({ title: (res.data && res.data.msg) || '搜索失败', icon: 'none' });
        }
      },
      fail: function () {
        that.setData({ loading: false, searched: true, list: [] });
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
      }
    });
  },

  addCart: function (e) {
    var dishId = e.currentTarget.dataset.id;
    var soldOut = e.currentTarget.dataset.soldout;
    if (soldOut) {
      uni.showToast({ title: '该菜品已售罄', icon: 'none' });
      return;
    }
    uni.request({
      url: BASE_URL + '/user/shoppingCart/add',
      method: 'POST',
      header: getHeader(),
      data: { dishId: dishId },
      success: function (res) {
        if (res.data && res.data.code === 1) {
          uni.showToast({ title: '已加入购物车', icon: 'success' });
        } else {
          uni.showToast({ title: (res.data && res.data.msg) || '加入失败', icon: 'none' });
        }
      },
      fail: function () {
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  goHot: function () {
    uni.navigateTo({ url: '/pages/hotSales/index' });
  }
});

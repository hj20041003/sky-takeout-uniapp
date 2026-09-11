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

  onLoad: function () {
    this.loadList();
  },

  onPullDownRefresh: function () {
    this.loadList();
  },

  loadList: function () {
    var that = this;
    this.setData({ loading: true });
    uni.request({
      url: BASE_URL + '/user/dish/presale',
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        var list = (res.data && res.data.data) || [];
        list = list.map(function (d) {
          return {
            id: d.id,
            name: d.name,
            price: d.price,
            spec: d.spec || d.unit || '',
            start: d.presaleStart || '',
            end: d.presaleEnd || '',
            delivery: d.presaleDeliveryDate || ''
          };
        });
        that.setData({ list: list });
      },
      fail: function () {
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
      },
      complete: function () {
        that.setData({ loading: false });
        uni.stopPullDownRefresh();
      }
    });
  }
});

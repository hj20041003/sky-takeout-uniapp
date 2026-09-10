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
    orderId: null,
    score: 0,
    content: '',
    submitting: false,
    existing: null
  },

  onLoad: function (options) {
    this.setData({ orderId: options.orderId ? Number(options.orderId) : null });
    this.loadExisting();
  },

  loadExisting: function () {
    var that = this;
    if (!that.data.orderId) return;
    uni.request({
      url: BASE_URL + '/user/comment/byOrder?orderId=' + that.data.orderId,
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1 && res.data.data) {
          that.setData({ existing: res.data.data });
        }
      }
    });
  },

  pickStar: function (e) {
    if (this.data.existing) return;
    this.setData({ score: e.currentTarget.dataset.score });
  },

  onContentInput: function (e) {
    this.setData({ content: e.detail.value });
  },

  submit: function () {
    var that = this;
    if (that.data.submitting) return;
    if (!that.data.score) {
      uni.showToast({ title: '请先选择评分', icon: 'none' });
      return;
    }
    that.setData({ submitting: true });
    uni.request({
      url: BASE_URL + '/user/comment/submit',
      method: 'POST',
      header: getHeader(),
      data: {
        orderId: that.data.orderId,
        score: that.data.score,
        content: (that.data.content || '').trim()
      },
      success: function (res) {
        if (res.data && res.data.code === 1) {
          uni.showToast({ title: '评价成功', icon: 'success' });
          setTimeout(function () { uni.navigateBack({}); }, 1200);
        } else {
          that.setData({ submitting: false });
          uni.showToast({ title: (res.data && res.data.msg) || '提交失败', icon: 'none' });
        }
      },
      fail: function () {
        that.setData({ submitting: false });
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
      }
    });
  }
});

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
    amount: '',
    reason: '',
    submitting: false,
    exists: null
  },

  onLoad: function (options) {
    this.setData({
      orderId: options.orderId ? Number(options.orderId) : null,
      amount: options.amount || ''
    });
    this.checkExists();
  },

  checkExists: function () {
    var that = this;
    if (!that.data.orderId) return;
    uni.request({
      url: BASE_URL + '/user/refund/status?orderId=' + that.data.orderId,
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        if (res.data && res.data.code === 1 && res.data.data) {
          that.setData({ exists: res.data.data });
        }
      }
    });
  },

  onReasonInput: function (e) {
    this.setData({ reason: e.detail.value });
  },

  submit: function () {
    var that = this;
    if (that.data.submitting) return;
    var reason = (that.data.reason || '').trim();
    if (!reason) {
      uni.showToast({ title: '请填写申请原因', icon: 'none' });
      return;
    }
    that.setData({ submitting: true });
    uni.request({
      url: BASE_URL + '/user/refund/apply',
      method: 'POST',
      header: getHeader(),
      data: { orderId: that.data.orderId, reason: reason },
      success: function (res) {
        if (res.data && res.data.code === 1) {
          uni.showToast({ title: '申请已提交', icon: 'success' });
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

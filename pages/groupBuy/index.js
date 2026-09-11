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
      url: BASE_URL + '/user/groupBuy/list',
      method: 'GET',
      header: getHeader(),
      success: function (res) {
        that.setData({ list: (res.data && res.data.data) || [] });
      },
      fail: function () {
        uni.showToast({ title: '网络异常，请检查后端服务', icon: 'none' });
      },
      complete: function () {
        that.setData({ loading: false });
        uni.stopPullDownRefresh();
      }
    });
  },

  // 开新团
  openTeam: function (e) {
    var gbId = e.currentTarget.dataset.id;
    this.doJoin(gbId, null);
  },

  // 参与进行中的团：拉取可参团列表后选择
  joinTeam: function (e) {
    var gbId = e.currentTarget.dataset.id;
    var that = this;
    uni.request({
      url: BASE_URL + '/user/groupBuy/teams',
      method: 'GET',
      header: getHeader(),
      data: { groupBuyId: gbId },
      success: function (res) {
        var teams = (res.data && res.data.data) || [];
        if (!teams.length) {
          uni.showToast({ title: '暂无进行中的团，去开个新团吧', icon: 'none' });
          return;
        }
        var names = teams.map(function (t) {
          return '团#' + t.id + '  已' + t.currentNum + '人';
        });
        uni.showActionSheet({
          itemList: names,
          success: function (r) {
            that.doJoin(gbId, teams[r.tapIndex].id);
          },
          fail: function () {}
        });
      },
      fail: function () {
        uni.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  doJoin: function (gbId, teamId) {
    var that = this;
    var data = { groupBuyId: gbId };
    if (teamId) { data.teamId = teamId; }
    uni.showLoading({ title: '提交中' });
    uni.request({
      url: BASE_URL + '/user/groupBuy/join',
      method: 'POST',
      header: getHeader(),
      data: data,
      success: function (res) {
        if (res.data && res.data.code === 1) {
          var t = res.data.data || {};
          uni.showToast({
            title: t.status === 2 ? '拼团成功！' : '参团成功，等待成团',
            icon: 'success'
          });
          that.loadList();
        } else {
          uni.showToast({ title: (res.data && res.data.msg) || '参团失败', icon: 'none' });
        }
      },
      fail: function () {
        uni.showToast({ title: '网络异常', icon: 'none' });
      },
      complete: function () { uni.hideLoading(); }
    });
  }
});

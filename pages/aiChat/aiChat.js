// AI 客服服务地址（sky-ai-service，本地端口 8081）
// 真机调试时把 localhost 换成电脑的局域网 IP（如 http://192.168.1.5:8081）
// 微信开发者工具需在「详情 → 本地设置」勾选「不校验合法域名」
const AI_BASE_URL = 'http://localhost:8081';

Page({
  data: {
    messages: [
      {
        role: 'ai',
        text: '你好，我是小红碗生鲜智能客服～可以问我平台规则（营业时间、配送费、优惠券、退款等），也可以报订单号让我帮你查订单进展。'
      }
    ],
    input: '',
    loading: false,
    scrollTo: '',
    conversationId: '',
    scrollH: 0
  },

  onLoad() {
    // 会话 ID：本地持久化，多次进入仍是同一会话（可继续上下文）
    let cid = wx.getStorageSync('sky_ai_cid');
    if (!cid) {
      cid = 'mp-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      wx.setStorageSync('sky_ai_cid', cid);
    }
    let h = 600;
    try {
      h = wx.getSystemInfoSync().windowHeight;
    } catch (e) {}
    this.setData({ conversationId: cid, scrollH: h });
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  scrollBottom() {
    this.setData({ scrollTo: 'msg' + (this.data.messages.length - 1) });
  },

  send() {
    const text = (this.data.input || '').trim();
    if (!text || this.data.loading) return;

    const messages = this.data.messages.concat([{ role: 'user', text: text }]);
    this.setData({ messages: messages, input: '', loading: true });
    this.scrollBottom();

    const that = this;
    wx.request({
      url: AI_BASE_URL + '/ai/chat',
      method: 'GET',
      data: { query: text, conversationId: this.data.conversationId },
      timeout: 60000,
      success(res) {
        let reply;
        if (typeof res.data === 'string') {
          reply = res.data;
        } else if (res.data && (res.data.msg || res.data.message)) {
          reply = res.data.msg || res.data.message;
        } else {
          reply = '（没有收到回复）';
        }
        that.setData({
          messages: that.data.messages.concat([{ role: 'ai', text: reply }])
        });
      },
      fail() {
        that.setData({
          messages: that.data.messages.concat([
            {
              role: 'ai',
              text: '网络异常，暂时联系不上客服。请确认 AI 服务已启动（8081），并已在开发者工具勾选「不校验合法域名」。'
            }
          ])
        });
      },
      complete() {
        that.setData({ loading: false });
        that.scrollBottom();
      }
    });
  }
});

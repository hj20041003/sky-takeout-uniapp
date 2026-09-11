# 小红碗生鲜外送 · 微信小程序

社区生鲜外送平台的**用户端小程序**（uni-app 编译产物 / mp-weixin），
> PC 管理端源码在另一个仓库：**https://github.com/hj20041003/sky-takeout-admin**

---

## 运行

用**微信开发者工具**直接打开本仓库根目录即可（`project.config.json` 已配置）。

- 后端地址：各页面 `index.js` 里的 `BASE_URL`（默认 `http://localhost:8080`）
- 后端需先启动（Spring Boot 主服务，端口 8080）

---

## ⚠️ 两个必须知道的点

1. **本仓库是 uni-app 的编译产物**（没有 uni-app 源码工程）。
   直接改这里的 `.js/.wxml/.wxss` 可立即生效；
   但如果用 uni-app 源码重新编译，**手工修改会被覆盖**。

2. **uni-app 编译页的事件绑定写法特殊**：
   必须用 `data-event-opts="{{[['tap',[['方法名']]]]}}" bindtap="__e"`，
   手写原生 `bindtap="方法名"` **不会被派发**（本项目踩过：点击无反应）。
   首页的方法定义在 `common/vendor.js`（编译产物的方法都在那里，`pages/index/index.js` 只是 webpack 块）。

---

## 生鲜改造相关页面

| 文件 | 功能 |
|:---|:---|
| `pages/search/index.js` | **加购支持多规格**：先请求 `/user/dish/skus?dishId=`，有规格用 `uni.showActionSheet` 让用户选规格后带 `skuId` 加购；无规格或查询失败**自动退回原逻辑**（标品不受影响） |
| `pages/groupBuy/` | **拼团页**：进行中的活动列表（商品名/拼团价/N人成团/截止时间）+ **开新团** / **加入进行中的团**（ActionSheet 选团） |
| `pages/presale/` | **预售页**：预售商品列表（预售期 + 高亮预计发货日 + 价格） |
| `pages/index/index.wxml` | 首页新增 **搜索 / 热销 / 拼团 / 预售** 四个入口；修复分类栏首个分类未对齐（`padding-top: 140rpx → 0`） |
| `common/vendor.js` | 新增首页跳转方法 `goGroupBuy` / `goPresale` |
| `pages/aiChat/` | AI 智能客服（SSE 流式对话） |
| `static/logo*.png` | 品牌 logo 与首页店铺头像（小红碗生鲜） |

---

## 品牌
本项目品牌为「**小红碗生鲜外送**」。

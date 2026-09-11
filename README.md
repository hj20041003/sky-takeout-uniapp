# 小红碗生鲜外送 · 前端

本仓库包含两套前端：

| 目录 | 内容 | 技术栈 | 运行方式 |
|:---|:---|:---|:---|
| `/`（根目录） | 微信小程序 | uni-app 编译产物（mp-weixin） | 微信开发者工具直接打开本目录 |
| `admin/` | PC 管理端 | Vue2 + TypeScript + Element UI | `npm install` → `npm run serve`（端口 8888） |

---

## 管理端（admin/）

```bash
cd admin
npm install

# 开发
npm run serve            # 端口 8888

# 构建（⚠️ Node 17+ 必须加 openssl legacy 标志，否则报 0308010C 错误）
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

**部署**：把 `admin/dist/` 的内容拷贝到 nginx 的静态目录（例如 `D:\nginx-1.20.2\html\sky`），
管理端通过 `/api/` 前缀请求，由 nginx 反向代理到后端 `http://localhost:8080/admin/`。

> 常见坑：只跑 `npm run build` 而没拷贝到 nginx 目录，页面不会更新。

### 生鲜改造相关页面
- `src/views/dish/addDishtype.vue` — 商品表单新增：生鲜属性（售卖方式/单位/规格/存储温层/产地/保质期/称重区间）、**SKU 多规格编辑器**、预售开关与发货日
- `src/views/groupBuy/index.vue` — **拼团活动管理**（列表 + 新增弹窗），路由注册在 `src/router.ts`
- `src/api/groupBuy.ts` — 拼团活动接口

---

## 微信小程序（根目录）

- 用微信开发者工具打开**仓库根目录**即可（`project.config.json` 已配置）
- 后端地址在各页面 `index.js` 的 `BASE_URL`（默认 `http://localhost:8080`）

> ⚠️ 本目录是 **uni-app 编译产物**：直接改这里可立即生效；若用 uni-app 源码重新编译，手工修改会被覆盖。
> 另注意：uni-app 编译页的事件必须用 `data-event-opts="{{[['tap',[['方法名']]]]}}" bindtap="__e"`，手写原生 `bindtap` 不会被派发。

### 生鲜改造相关页面
- `pages/search/index.js` — 加购支持多规格：先查 `/user/dish/skus`，有规格用 `uni.showActionSheet` 选规格后带 `skuId` 加购（无规格/查询失败自动退回原逻辑）
- `pages/groupBuy/` — **拼团页**：活动列表 + 开新团 / 加入进行中的团
- `pages/presale/` — **预售页**：预售商品列表（预售期 + 预计发货日）
- `pages/index/index.wxml` — 首页新增 搜索 / 热销 / 拼团 / 预售 四入口
- `common/vendor.js` — 首页跳转方法 `goGroupBuy` / `goPresale`（编译产物的方法都在这里）

---

## 品牌
本项目品牌为「**小红碗生鲜外送**」（由教学项目「苍穹外卖」改造而来，品牌字样与 logo 已整体替换）。

# 股小白 · 股票工作台 — 部署与自定义指南

一个**纯静态 PWA（零后端）**的股票工作台，面向完全不懂炒股的小白，可在 iPhone Safari 通过「添加到主屏幕」获得类原生 App 的全屏体验。

---

## 一、功能与结构速览

- **实时行情看板**：三大指数 + 自选股概览（红涨绿跌，符合 A 股习惯）
- **自选股管理**：输入 6 位代码添加 / 热门一键添加 / 详情页（走势图 + 技术信号）/ 长按移除
- **简易买卖信号**：本地计算 MA / RSI / MACD → 偏多 / 偏空 / 观望，强制风险提示
- **财经资讯**：常驻「理财小课堂」科普卡片（离线可用）+ 实时 RSS 头条（best-effort 兜底）
- **术语科普**：~43 条 A 股术语，6 大分类，支持搜索

技术栈：原生 HTML/CSS/JS（无框架、无构建步骤）+ Service Worker 离线缓存 + Web App Manifest。行情直连腾讯公开接口（JSONP，免 Key），资讯走免费 RSS→JSON 代理。

---

## 二、本地预览

```bash
cd 项目目录
python3 -m http.server 8137
# 浏览器打开 http://localhost:8137
```

> ⚠️ Service Worker 只在 `https://` 或 `http://localhost` 下注册，`file://` 直接打开不会生效（不影响页面渲染，只是没有离线能力）。

---

## 三、部署到 Cloudflare Pages（推荐，免费 HTTPS）

> 你已经注册了 Cloudflare 账号并登录了 Dashboard，下面从你当前所在的页面开始。

### ⚠️ 先纠正一个导航误区（重要）

我之前写的「左侧菜单 → Build → Pages」是**错的**。当前 Cloudflare Dashboard（2024 以后）里：

- **「Build」分类下面没有 Pages**；
- **Pages 合并在「Workers 和 Pages」入口里**。

> 如果你在左侧菜单里怎么都找不到 Pages，最快的办法是：用 Dashboard 顶部的**搜索框**直接输入 `Pages` 回车，会直接跳到 Pages 列表。

---

### 方案 A：连接 GitHub 自动部署（改代码后自动重新发布）

#### 前置准备：把代码推到 GitHub

1. 在 [GitHub](https://github.com/) 新建一个仓库（如 `guxiaobai-stock-pwa`）。
2. 把本项目**全部文件**推送到该仓库：

```bash
cd /path/to/股小白项目目录
git init
git add .
git commit -m "init: 股小白股票工作台 PWA"
git branch -M main
git remote add origin https://github.com/<你的用户名>/guxiaobai-stock-pwa.git
git push -u origin main
```

> ⚠️ 必须包含所有文件：`index.html`、`manifest.webmanifest`、`sw.js`、`css/`、`js/`、`data/`、`assets/icons/`。缺一不可。

#### 步骤 1：进入 Pages 创建页面

在 Cloudflare Dashboard 左侧菜单中：

1. 点击 **「Workers 和 Pages」**（中文界面）或 **「Workers & Pages」**（英文界面）。
   > 不要点「Build」——Pages 不在那里。
2. 点击右上角的 **「创建应用程序」**（Create application）按钮。
3. 在弹出的页面里，选顶部 **「Pages」** 标签页。
4. 点击 **「连接到 Git」**（Connect to Git）或 **「导入已有 Git 仓库」**（Import an existing Git repository）。

#### 步骤 2：关联 GitHub 仓库

1. 在弹出的列表中选择 **GitHub**（首次需授权 Cloudflare 访问你的仓库）。
2. 授权后，找到刚创建的 `guxiaobai-stock-pwa`，点击它。
3. 点 **「开始设置」**（Begin setup）。

#### 步骤 3：配置构建设置（关键！）

> **本项目是纯静态站，无需打包/编译**。配置如下：

| 设置项 | 值 | 说明 |
| --- | --- | --- |
| **Project name** | `guxiaobai`（可自定义） | 显示在 Pages 列表中的名称 |
| **Production branch** | `main` | 默认即可 |
| **Build command** | **`exit 0`** ⚠️ | 纯静态站官方推荐填 `exit 0`（留空有时也行，但 `exit 0` 更稳，可启用 Pages Functions） |
| **Build output directory** | 留空即可 | 文件就在根目录，Cloudflare 会自动用根目录作为输出 |

确认后点击 **「保存并部署」**（Save and Deploy）。

#### 步骤 4：等待部署完成

1. Cloudflare 会自动拉取代码并部署（通常 **30 秒内** 完成）。
2. 部署成功后会显示 **`*.pages.dev`** 域名，例如：`https://guxiaobai.pages.dev`
3. **立即用手机 Safari 打开测试**（见第五节）。

---

### 方案 B：直接上传文件夹（更简单，无需 GitHub）

如果你不想折腾 Git，可以用 Cloudflare 的 **Direct Upload（直接上传）**，把整个项目文件夹拖上去就行：

1. 左侧菜单 → **「Workers 和 Pages」** → **「创建应用程序」** → **「Pages」** 标签页。
2. 这次不选「连接到 Git」，而选 **「直接上传」**（Direct Upload / 上传文件夹）。
3. 给项目起名（如 `guxiaobai`），点 **「创建」**。
4. 把本项目的**整个文件夹内容**（不是文件夹本身，是里面的 `index.html`、`css/`、`js/` …）拖到上传区，或直接选择这些文件。
5. 点 **「部署」**（Deploy），几秒后得到 `*.pages.dev` 域名。

> 缺点：以后改了代码要**重新上传**才能更新；方案 A 改完 `git push` 会自动重新部署。新手赶时间推荐方案 B，想长期维护用方案 A。

---

### （可选）绑定自定义域名

如果你有自己的域名，想让 App 用更短的地址：

1. 在该项目 Pages 设置中，点击 **「Custom domains」**。
2. 输入你的域名（如 `stock.example.com`）。
3. 按提示在域名 DNS 处添加 CNAME 记录指向 `<项目名>.pages.dev`。
4. 等 SSL 证书自动签发（通常几分钟）。

---

### 常见问题排查

| 问题 | 原因 | 解决方法 |
| --- | --- | --- |
| 页面空白 / JS 报错 | 构建命令填错或输出目录错 | Build command 填 `exit 0`、Build output directory 留空 |
| 图标不显示 | `assets/icons/` 未上传 | 确保 git push 包含了 icons 目录 |
| 行情全是 `--` | 腾讯接口被浏览器拦截 | 确认是用 **HTTPS** 访问（HTTP 下 JSONP 正常但 SW 不注册） |
| iPhone 添加后不是全屏 | 缺少 manifest 或 meta | 确认 `index.html` 的 meta 标签完整上传 |
| 国内访问慢 | Cloudflare CDN 节点 | 可选绑定国内 CDN 或用国内托管替代 |

---

## 四、部署到 GitHub Pages（免费 HTTPS）

1. 推送到 GitHub 仓库。
2. 仓库 **Settings → Pages → Source** 选择 `main` 分支、`/ (root)` 目录。
3. 等待约 1 分钟，访问 `https://<用户名>.github.io/<仓库名>/`。

> 若部署在子路径（如 `/<仓库名>/`），请确认 `manifest.webmanifest` 的 `start_url` 能正确解析（本模板用 `/index.html`，放在根域名最省心）。

---

## 五、iPhone Safari「添加到主屏幕」实测

iOS **不会**自动弹出安装提示，需手动操作（本 App 首次打开会显示内置引导浮层）：

1. 用 **Safari** 打开部署后的 **HTTPS** 链接。
2. 点底部工具栏的 **分享图标**（⬆ 方块箭头）。
3. 向上滑动，选择 **「添加到主屏幕」**。
4. 可修改主屏幕图标名称，点 **「添加」**。
5. 回到主屏幕，点新图标即可**全屏、无地址栏**打开，体验接近原生 App。

> 测试清单：离线（飞行模式）再次打开已访问过的页面能否加载？行情是否随交易日自动刷新？图标是否为你设置的 180×180 图？

---

## 六、自定义

| 想改什么 | 改哪里 |
| --- | --- |
| App 名称（标题/主屏名） | `index.html` 的 `<title>` 与 `apple-mobile-web-app-title`，以及 `manifest.webmanifest` 的 `name` / `short_name` |
| 图标 | 替换 `assets/icons/` 下各尺寸 PNG（用 `tools/gen_icons.py` 重新生成；建议保留 180/192/512 + `maskable-512`） |
| 自选股**默认种子** | `js/store.js` 的 `DEFAULT_WL`（首次打开时自动写入） |
| 热门快捷添加 | `data/popular.json`（已与自选列表联动，改这里即生效） |
| 科普词条 | `data/glossary.json`（也可用 `tools/gen_glossary.py` 重新生成） |
| 资讯源 | `js/data.js` 顶部的 `FEEDS`（RSS 源）与 `PROXIES`（CORS 代理） |
| 交易时段/状态文案 | `js/data.js` 的 `isTradingNow()` / `marketStatusText()` |
| 主题色 | `css/style.css` 的 `:root` 变量（`--c-blue` 主色、`--c-red`/`--c-green` 涨跌色） |

> 注意：红涨绿跌是 A 股习惯；`--c-red` 对应涨、`--c-green` 对应跌，改色时保持一致。

---

## 七、让资讯更稳定（可选：Cloudflare Worker 代理）

免费 RSS 代理偶尔不稳定。若想要更稳的实时资讯，可加一个 Cloudflare Worker 做代理，然后把 `js/data.js` 的 `PROXIES` 指向它：

```js
// worker.js（Cloudflare Workers）
export default {
  async fetch(request) {
    const url = new URL(request.url).searchParams.get('url');
    if (!url) return new Response('missing url', { status: 400 });
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    return new Response(await r.text(), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/xml' }
    });
  }
};
```

部署后在 `js/data.js` 把 `PROXIES` 改为 `['https://你的worker子域.workers.dev/?url=']` 即可。

---

## 八、iOS PWA 已知限制（务必了解）

- **无自动安装提示**：必须用户手动「添加到主屏幕」（本 App 已内置引导）。
- **离线能力有限**：Service Worker 采用「外壳缓存优先」，已访问过的页面在飞行模式下可打开；但**实时行情、K 线、资讯必须联网**。
- **首次需联网**：首次打开会缓存外壳，之后离线才能打开已访问页面。
- **单窗口**：PWA 在 iOS 上不支持多实例，所有跳转在同一窗口。
- **数据延迟**：行情来自公开接口，可能有数秒到数十秒延迟，仅作学习参考，**不构成投资建议**。

---

## 九、目录结构

```
.
├── index.html              # 应用外壳（meta / 图标 / tab 结构）
├── manifest.webmanifest     # PWA 描述（名称、图标、standalone）
├── sw.js                    # Service Worker（离线缓存）
├── css/
│   └── style.css            # 移动优先样式 + 安全区适配
├── js/
│   ├── store.js             # localStorage：自选/设置/快照/引导状态
│   ├── indicators.js        # SMA / RSI / MACD 纯函数
│   ├── signals.js           # 指标 → 偏多/偏空/观望 大白话翻译
│   ├── data.js              # 腾讯 JSONP 行情/K线 + RSS 资讯
│   ├── ui-dashboard.js      # 看板
│   ├── ui-watchlist.js      # 自选 + 详情走势
│   ├── ui-signals.js        # 信号（含强制免责声明）
│   ├── ui-news.js           # 资讯（科普卡片 + 实时头条）
│   ├── ui-glossary.js       # 术语科普
│   └── app.js               # 启动 / 路由 / 轮询 / 弹窗 / SW 注册
├── data/
│   ├── glossary.json        # 术语词条（可由 tools/gen_glossary.py 生成）
│   └── popular.json         # 热门股票（自选快捷添加数据源）
├── assets/icons/           # 180/192/512 + maskable 图标
└── tools/
    ├── gen_icons.py         # 生成 App 图标
    ├── gen_glossary.py      # 重新生成术语 JSON
    └── smoke_test.js        # 无头冒烟测试（jsdom）
```

---

## 十、验证与测试

本地已用 jsdom 做无头冒烟测试（见 `tools/smoke_test.js`），覆盖：模块加载、五个 Tab 渲染、风险→引导弹窗流程、信号计算。运行：

```bash
# 先启动本地服务
python3 -m http.server 8137 &
# 另开终端
NODE_PATH=<node_modules 路径> node tools/smoke_test.js
```

部署前建议再用 Chrome DevTools 的 Lighthouse（勾选 PWA）跑一次审计，确认可安装性（Installable）与离线（Offline）通过。

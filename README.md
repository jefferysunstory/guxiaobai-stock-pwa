# 股小白 · 股票工作台

面向 A 股小白的移动端股票工作台（PWA）。纯静态、零后端，iPhone Safari「添加到主屏幕」即可获得类原生 App 体验。

## 功能模块

| 模块 | 说明 |
|------|------|
| 实时行情看板 | 上证/深证/创业板三大指数 + 自选概览（红涨绿跌） |
| 自选股管理 | 6 位代码添加、热门一键添加、详情走势图、移除 |
| 简易买卖信号 | 本地 MA/RSI/MACD → 偏多/偏空/观望 + 强制风险提示 |
| 财经资讯 | 常驻理财科普卡片 + 实时 RSS 头条（best-effort 兜底） |
| 术语科普 | 43 条术语、6 大分类、支持搜索 |

## 目录结构

```
guxiaobai-stock/
├── index.html            # 页面骨架、App 标题
├── manifest.webmanifest  # PWA 配置
├── sw.js                 # Service Worker 离线缓存
├── css/style.css         # 全部样式（配色、主题）
├── js/
│   ├── app.js            # 主控制器（Tab 切换、初始化）
│   ├── store.js          # localStorage 存储、默认自选股
│   ├── data.js           # 行情/K线/资讯数据抓取
│   ├── indicators.js     # MA/RSI/MACD 技术指标
│   ├── signals.js        # 买卖信号逻辑
│   ├── ui-dashboard.js   # 看板模块
│   ├── ui-watchlist.js   # 自选股模块
│   ├── ui-signals.js     # 信号模块
│   ├── ui-news.js        # 资讯模块
│   └── ui-glossary.js    # 术语科普模块
├── data/
│   ├── glossary.json     # 术语科普词条（43条）
│   └── popular.json      # 热门股票快捷列表
├── assets/icons/         # App 图标（180/192/512 + maskable）
├── tools/                # 生成/测试脚本
└── deploy-guide.md       # 部署说明
```

## 如何本地预览

```bash
cd /path/to/guxiaobai-stock
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 常见修改点

| 想改什么 | 改哪个文件 |
|---------|-----------|
| App 名字「股小白」 | `index.html` 的 `<title>` 和 `<h1>` |
| 主色调 / 红涨绿跌颜色 | `css/style.css` 里的 `--c-blue` / `--c-red` / `--c-green` |
| 默认自选股 | `js/store.js` 的 `DEFAULT_WL` |
| 买卖信号规则 | `js/signals.js` |
| 术语词条 | `data/glossary.json` |
| 热门股票列表 | `data/popular.json` |
| App 图标 | `assets/icons/`（替换同名 PNG） |

## 数据来源

- 实时行情：腾讯公开接口 `qt.gtimg.cn`（JSONP 直连，免 Key）
- 历史 K 线：`web.ifzq.gtimg.cn`（JSONP）
- 资讯：RSS 代理（best-effort，失败时回退到内置科普卡片）

> ⚠️ 所有买卖信号仅供教学参考，非投资建议。

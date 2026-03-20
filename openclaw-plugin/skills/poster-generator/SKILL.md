---
name: poster-generator
description: 使用 JS VI System 品牌视觉识别系统生成海报。支持多种模板、配色方案、尺寸和输出格式。
version: 1.0.1
author: js-vi-system
---

# 海报生成器

使用 JS 品牌视觉识别系统（Neo-Brutalism + Cyberpunk 风格）生成海报和品牌素材。

## 触发条件

| 场景 | 行为 |
|------|------|
| 用户需要生成海报、宣传图、活动海报 | 触发海报生成流程 |
| 用户询问品牌设计规范、配色、字体 | 使用 `vi_tokens_get` 或 `vi_brand_info` 查询 |
| 用户需要查看可用模板 | 使用 `vi_templates_list` 列出模板 |

## 可用模板

| 模板 | 风格 | 适用场景 |
|------|------|---------|
| `terminal` | 终端/命令行风格，打字机动画 | 技术分享、产品发布、极客活动 |
| `card` | 卡片式布局，滑入动画 | 通用活动、社交媒体卡片 |
| `cybertaoist` | 赛博道家风格，Logo 脉冲动画 | 品牌宣传、哲学主题、高端活动 |
| `wechat-cover` | 公众号封面 / 略缩图风格排版 | 头条封面（900×）、方形略缩图（500×） |

## 配色方案

| 方案 | 说明 |
|------|------|
| `dark` | 暗色主题（黑底黄字），默认方案，最具品牌辨识度 |
| `daylight` | 亮色主题（浅底深字），适合正式场合 |
| `minimal` | 极简主题（黑白为主），适合需要低调风格的场景 |

## 尺寸

| 尺寸 | 规格 | 适用场景 |
|------|------|---------|
| `a4` | 595×842 竖版 | 传单、海报打印，默认尺寸 |
| `square` | 640×640 方形 | 社交媒体头像、Instagram |
| `banner` | 640×360 横幅（16:9） | 网站 Banner、YouTube 封面 |
| `story` | 420×748 竖屏（9:16） | 手机壁纸、Instagram Story |
| `wechat-cover` | 900×383 | 微信公众号头条封面 |
| `wechat-thumb` | 500×500 | 微信公众号方形略缩图 |

## 输出格式

| 格式 | 说明 | 依赖 |
|------|------|------|
| `html` | HTML 文件，最快速，可直接在浏览器中打开 | 无 |
| `png` | PNG 图片，无损高清 | 需要 Chrome/Edge |
| `jpeg` | JPEG 图片，可控质量 | 需要 Chrome/Edge |
| `svg` | SVG 矢量图 | 无 |
| `pdf` | PDF 文档 | 需要 Chrome/Edge |
| `gif` | GIF 动画（包含模板动画效果） | 需要 Chrome/Edge |

推荐策略：
- 快速预览 → `html`
- 社交媒体分享 → `png`
- 需要动画效果 → `gif`
- 打印用途 → `pdf`

## 典型流程

### 1. 生成单张海报

```
1. 调用 vi_templates_list 查看可用模板（如果不确定用哪个）
2. 调用 vi_poster_generate，传入：
   - template: 模板名称
   - title: 海报标题（支持 \n 换行）
   - subtitle: 副标题（可选）
   - format: 输出格式（默认 html）
   - scheme: 配色方案（默认 dark）
   - size: 尺寸（默认 a4）
3. 返回生成的文件路径
```

### 2. 查询品牌规范

```
1. 调用 vi_brand_info 获取品牌文档
   - topic: identity → 品牌身份定义
   - topic: philosophy → 品牌哲学
   - topic: principles → 设计原则
   - topic: tone → 语调与风格
2. 调用 vi_tokens_get 获取具体设计值
   - category: colors → 品牌色彩体系
   - category: typography → 字体规范
```

## 注意事项

- 生成 PNG/JPEG/PDF/GIF 需要本地安装 Chrome 或 Edge 浏览器，并在插件配置中设置 `browserPath`
- 模板字段有默认值，用户未指定的字段会使用模板默认内容
- `title` 字段支持 `\n` 换行，适合制作多行标题
- 各模板均支持三种配色方案；通用尺寸含 `a4` / `square` / `banner` / `story`，`wechat-cover` 模板另支持 `wechat-cover` 与 `wechat-thumb`

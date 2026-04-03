# Creating Custom Poster Templates

本文档说明如何为 JS VI System 创建自定义海报模板。

## 目录结构

每个模板是 `templates/` 下的一个子目录，包含以下文件：

```
templates/
└── my-template/
    ├── render.js      # 必须 — 渲染函数
    ├── meta.json      # 必须 — 模板元数据
    └── styles.css     # 可选 — 模板专属样式
```

> 以 `_` 开头的目录（如 `_shared/`）会被模板扫描器忽略。

---

## meta.json

定义模板的名称、字段和支持的配色/尺寸。

```json
{
  "name": "my-template",
  "label": "My Template",
  "fields": [
    { "key": "title", "type": "text", "required": true, "default": "HELLO\nWORLD" },
    { "key": "subtitle", "type": "string", "default": "// subtitle text" },
    { "key": "date", "type": "string", "default": "2026.01.01" },
    { "key": "tag", "type": "string", "default": "TAG" }
  ],
  "sizes": ["a4", "square", "banner", "story"],
  "schemes": ["daylight", "dark", "minimal"],
  "animation": {
    "supported": true,
    "duration": 3000,
    "defaultFps": 10,
    "description": "Description of the animation"
  },
  "textLayout": {
    "title": {
      "font": "700 48px Space Grotesk",
      "lineHeight": 52.8,
      "maxWidth": 515,
      "maxHeight": 400,
      "transform": "uppercase",
      "sizeOverrides": {
        "banner": { "font": "700 32px Space Grotesk", "lineHeight": 35.2, "maxWidth": 592, "maxHeight": 180 }
      }
    }
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 模板唯一标识，用于 CLI `--template` 参数 |
| `label` | string | 显示名称 |
| `fields` | array | 可编辑字段定义 |
| `fields[].key` | string | 字段键名，对应 `content` 对象的属性 |
| `fields[].type` | string | `"text"`（多行）或 `"string"`（单行） |
| `fields[].required` | boolean | 是否必填 |
| `fields[].default` | string | 默认值，多行文本用 `\n` 分隔 |
| `sizes` | array | 支持的尺寸：`a4` / `square` / `banner` / `story` / `wechat-cover` / `wechat-thumb` |
| `schemes` | array | 支持的配色：`daylight` / `dark` / `minimal` |
| `animation` | object | 可选，GIF 动画相关配置 |
| `textLayout` | object | 可选，文本排版约束（启用 `measure`/`typeset`/`lint` 等工具及 `--auto-fit`/`--balanced`） |

### textLayout 字段

`textLayout` 为 Pretext 文本引擎提供排版约束。键名必须与 `fields` 中的 `key` 一一对应（如 `title`、`subtitle`）。

```json
"textLayout": {
  "title": {
    "font": "700 48px Space Grotesk",
    "lineHeight": 52.8,
    "maxWidth": 515,
    "maxHeight": 400,
    "transform": "uppercase",
    "sizeOverrides": {
      "banner": { "font": "700 32px Space Grotesk", "lineHeight": 35.2, "maxWidth": 592, "maxHeight": 180 }
    }
  }
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `font` | string | CSS font shorthand，如 `"700 48px Space Grotesk"` |
| `lineHeight` | number | 行高（px），建议为 `fontSize × line-height 比率` |
| `maxWidth` | number | 文本最大宽度（px），通常 = 画布宽度 − 左右 padding |
| `maxHeight` | number | 文本最大高度（px），标题区域可用空间 |
| `transform` | string | 可选，`"uppercase"` 或 `"lowercase"` |
| `sizeOverrides` | object | 可选，按尺寸名覆盖约束；值可覆盖上述任意属性 |

**计算提示**：
- `maxWidth` = 画布宽度 − padding×2（如 595 − 40×2 = 515）
- `lineHeight` = fontSize × CSS line-height 比率（如 48 × 1.1 = 52.8）
- 如果某尺寸有不同的字号，`sizeOverrides` 中需一并提供 `font` 和 `lineHeight`

---

## render.js

导出一个 `render(content, options)` 函数，返回 HTML 片段字符串。

```javascript
import { LOGO_SVG } from '../_shared/logo.js';
import { esc } from '../_shared/utils.js';

export function render(content, options = {}) {
  const c = content;
  const animated = options.animated || false;

  return `
    <div class="poster my-poster" style="width:100%;height:100%">
      <h1>${esc(c.title)}</h1>
      <p>${esc(c.subtitle)}</p>
    </div>`;
}
```

### 参数

**`content`** — 用户输入的内容对象：

```javascript
{
  title: "HELLO\nWORLD",
  subtitle: "// some text",
  date: "2026.01.01",
  // ... 根据 meta.json 中定义的 fields
}
```

**`options`** — 渲染选项：

```javascript
{
  scheme: "dark",      // 当前配色方案
  size: "a4",          // 当前尺寸
  animated: false,     // 是否启用动画（GIF 模式下为 true）
}
```

### 重要规则

1. **纯函数** — render.js 不能依赖 Node API（`fs`、`path` 等），必须同时在浏览器和 Node 中运行
2. **HTML 片段** — 返回的是 HTML 片段，不是完整文档；外部包装器会添加 `<html>` / `<head>` 等
3. **转义** — 始终使用 `esc()` 处理用户输入，防止 XSS
4. **CSS 变量** — 使用配色方案变量（见下方），不要硬编码颜色
5. **根元素** — 最外层必须有 `class="poster"` 和 `style="width:100%;height:100%"`

---

## styles.css

模板专属样式，使用 CSS 变量来适配不同配色方案。

```css
.my-poster {
  background-color: var(--p-bg);
  color: var(--p-text);
  font-family: 'Space Grotesk', sans-serif;
}
```

### 可用的配色方案 CSS 变量

| 变量 | 说明 | daylight | dark | minimal |
|------|------|----------|------|---------|
| `--p-bg` | 背景色 | `#FCD228` | `#000000` | `#FFFFFF` |
| `--p-text` | 文字色 | `#000000` | `#FCD228` | `#000000` |
| `--p-accent` | 强调色 | `#000000` | `#FCD228` | `#FCD228` |
| `--p-surface` | 表面色 | `#FFFFFF` | `#111111` | `#FFFFFF` |
| `--p-border` | 边框色 | `#000000` | `#FCD228` | `#000000` |
| `--p-shadow` | 阴影色 | `#000000` | `#FCD228` | `#000000` |
| `--p-muted` | 次要文字色 | `#555` | `#888` | `#888` |
| `--p-grid-line` | 网格线色 | `rgba(0,0,0,0.08)` | `rgba(252,210,40,0.06)` | `rgba(0,0,0,0.04)` |
| `--p-tag-bg` | 标签背景 | `#000000` | `#FCD228` | `#000000` |
| `--p-tag-text` | 标签文字 | `#FCD228` | `#000000` | `#FCD228` |

### 文本排版 CSS 变量

当模板配置了 `textLayout` 且用户使用 `--auto-fit` 或 `--balanced` 选项时，渲染引擎会注入动态 CSS 变量。在 `styles.css` 中使用 `var()` 消费即可：

| 变量 | 来源 | 说明 |
|------|------|------|
| `--auto-title-size` | `--auto-fit` / `--target-lines` | 自动计算的字号（如 `42px`） |
| `--balanced-title-width` | `--balanced` | 均衡行宽的 max-width（如 `380px`） |

```css
.my-poster .title {
  font-size: var(--auto-title-size, 48px);
  max-width: var(--balanced-title-width, none);
}
```

> `var()` 的第二个参数是 fallback 值，当用户未启用相应选项时会使用。

### 添加配色方案特定覆盖

如果某些元素需要在特定配色下有不同样式：

```css
.scheme-dark .my-poster .special-element { color: #FCD228; }
.scheme-daylight .my-poster .special-element { color: #000; }
```

---

## 共享工具

从 `_shared/` 目录导入：

| 模块 | 导出 | 说明 |
|------|------|------|
| `../shared/logo.js` | `LOGO_SVG` | JS 品牌 Logo SVG 字符串 |
| `../_shared/utils.js` | `esc(str)` | HTML 转义函数 |
| `../_shared/sizes.js` | `SIZES` | 尺寸定义对象 |

### 可用尺寸

| Key | 宽 | 高 | 说明 |
|-----|-----|-----|------|
| `a4` | 595px | 842px | A4 竖版 |
| `square` | 640px | 640px | 正方形 |
| `banner` | 640px | 360px | 16:9 横版 |
| `story` | 420px | 748px | 9:16 竖版 |
| `wechat-cover` | 900px | 383px | 微信公众号头条封面（2.35:1） |
| `wechat-thumb` | 500px | 500px | 微信公众号次条封面 |

---

## 添加 GIF 动画支持

当 `options.animated === true` 时，渲染函数应输出带 CSS 动画的 HTML。

1. 在 `meta.json` 中声明动画支持
2. 在 `render.js` 中根据 `options.animated` 有条件地添加动画类和 `<style>`

```javascript
const ANIM_STYLES = `
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-title { animation: slideUp 0.6s ease-out both; animation-delay: 0.3s; }
`;

export function render(content, options = {}) {
  const animated = options.animated || false;
  return `
    ${animated ? `<style>${ANIM_STYLES}</style>` : ''}
    <div class="poster my-poster" style="width:100%;height:100%">
      <h1 class="${animated ? 'anim-title' : ''}">${esc(content.title)}</h1>
    </div>`;
}
```

GIF 渲染器会按 `fps` 和 `duration` 逐帧截图并编码为 GIF。

---

## 使用自定义模板目录

CLI 支持通过 `--templates-dir` 参数加载外部模板：

```bash
js-vi poster --template my-template --templates-dir ./my-templates -f png -o output.png
```

外部模板目录的结构与内置 `templates/` 目录相同。

### 快速脚手架

使用 `js-vi init` 可以一键创建外部模板插件仓库：

```bash
# 创建插件仓库并生成第一个模板骨架
js-vi init my-posters --template event-poster
cd my-posters
npm install

# 生成海报
npm run poster -- --template event-poster -f html -o output/test.html

# 使用批处理配置
npm run poster -- --config configs/example.json
```

生成的目录结构：

```
my-posters/
├── package.json              # 已配置 js-vi-system 依赖
├── .gitignore
├── configs/
│   └── example.json          # 示例批处理配置
└── event-poster/
    ├── meta.json
    ├── render.js
    └── styles.css
```

命令参数：

| 参数 | 说明 |
|------|------|
| `[directory]` | 目标目录，默认当前目录 |
| `-t, --template <name>` | 同时创建模板骨架 |
| `--vi-system-path <path>` | 手动指定 js-vi-system 路径（默认自动推断） |

---

## 文本排版工具

当模板声明了 `textLayout` 约束后，可使用以下 CLI 命令调试和验证文本排版：

### 度量（measure）

诊断指定字段在特定尺寸下的排版情况：

```bash
js-vi measure --template my-template --title "HELLO WORLD" --size a4
```

输出字段的行数、高度、填充率和溢出状态。外部模板需加 `--templates-dir`：

```bash
js-vi measure --template my-template --templates-dir ./my-templates --title "HELLO WORLD"
```

### 排版扫描（typeset）

跨所有尺寸扫描排版效果：

```bash
js-vi typeset --template my-template --title "HELLO WORLD"
```

### 最佳尺寸（best-size）

推荐填充率最优的尺寸：

```bash
js-vi best-size --template my-template --title "HELLO WORLD"
```

### 文本溢出检查（lint）

批量校验海报配置文件中的文本溢出：

```bash
js-vi lint --config posters.json
```

支持 `--strict` 模式，溢出时返回非零退出码，适合 CI 集成。

### 生成选项

`poster` 命令支持以下文本排版选项：

| 选项 | 说明 |
|------|------|
| `--auto-fit` | 自动缩放字号使文本填满约束区域 |
| `--balanced` | 均衡各行宽度，避免末行过短 |
| `--shrink-wrap` | 收缩画布宽度至文本实际宽度 |
| `--strict` | 文本溢出时终止渲染（退出码 1） |
| `--target-lines <n>` | 自动调整字号使文本恰好排满 n 行 |

```bash
js-vi poster --template my-template --auto-fit --balanced -f png -o out.png
```

---

## 设计规范提醒

所有模板必须遵循 JS VI System 设计规范：

- **禁止** 渐变、圆角（Logo 除外）、柔和阴影、Pastel 色
- **使用** 硬边框、硬阴影（box-shadow offset）、高对比
- **字体** Space Grotesk（正文）+ JetBrains Mono（代码/标签）
- **配色** 仅使用品牌三色：黄 `#FCD228`、黑 `#000000`、白 `#FFFFFF`

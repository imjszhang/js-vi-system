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
| `sizes` | array | 支持的尺寸：`a4` / `square` / `banner` / `story` |
| `schemes` | array | 支持的配色：`daylight` / `dark` / `minimal` |
| `animation` | object | 可选，GIF 动画相关配置 |

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

---

## 设计规范提醒

所有模板必须遵循 JS VI System 设计规范：

- **禁止** 渐变、圆角（Logo 除外）、柔和阴影、Pastel 色
- **使用** 硬边框、硬阴影（box-shadow offset）、高对比
- **字体** Space Grotesk（正文）+ JetBrains Mono（代码/标签）
- **配色** 仅使用品牌三色：黄 `#FCD228`、黑 `#000000`、白 `#FFFFFF`

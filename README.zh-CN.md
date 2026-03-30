# JS 视觉身份系统

**JS** 品牌的唯一权威来源 — 基于 **Neo-Brutalism + Cyberpunk** 美学的设计 Token、组件样式和品牌规范。另提供 **CLI 海报生成器**（多模板、多格式输出）。

版本与变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

## 快速开始

```bash
# 在你的项目中使用 Tailwind 预设
npm install js-vi-system
```

```js
// tailwind.config.js
import jsViSystem from 'js-vi-system'

export default {
  presets: [jsViSystem],
  // 你的覆盖配置...
}
```

或者直接使用 CSS：

```html
<link rel="stylesheet" href="js-vi-system/css/tokens.css">
<link rel="stylesheet" href="js-vi-system/css/brutal.css">
```

在本仓库根目录执行 `npm install` 后，可使用：

```bash
npm run poster -- --help          # 或：npx js-vi poster --help
node bin/js-vi.js templates       # 列出海报模板

# 文本排版工具
node bin/js-vi.js measure -t terminal --title "HELLO WORLD"
node bin/js-vi.js typeset -t terminal --title "长标题文本"
node bin/js-vi.js best-size -t terminal --title "某个标题"
node bin/js-vi.js lint --config posters.json

# 自动适配与均衡排版
node bin/js-vi.js poster -t terminal --title "长标题" --auto-fit --balanced
```

npm 包导出 `js-vi-system/templates`（模板引擎）及 `js-vi-system/templates/_shared/*`（共享模板静态资源子路径）。

## 结构

```
tokens/          设计 Token（JSON）— 唯一权威来源
css/             生成产物：tokens.css、brutal.css、tailwind-preset.js
assets/          Logo SVG、字体引用
brand/           品牌哲学、身份、设计原则
character/       Cyber-Taoist 人物形象规格
voice/           调性、风格、语言规范
preview/         交互式品牌手册（index.html）与海报画廊（posters.html）
build/           Token → CSS/JS 生成脚本
bin/             CLI 入口（js-vi）
cli/             Commander 命令（poster、templates、build、init、measure、typeset、best-size、lint）
core/            模板引擎、渲染与配置、文本测量
templates/       海报模板（如 terminal、card、cybertaoist、wechat-cover）
renderers/       HTML / 位图 / PDF / SVG / GIF 等输出适配
```

## 创建模板插件仓库

使用 `js-vi init` 一键脚手架化外部模板插件仓库：

```bash
npx js-vi init my-posters --template event-poster
cd my-posters
npm install
npm run poster -- --template event-poster -f html -o output/test.html
```

自动生成 `package.json`（依赖路径已配好）、`.gitignore`、示例批处理配置和可运行的模板骨架。详细模板开发指南见 [templates/CREATING_TEMPLATES.md](templates/CREATING_TEMPLATES.md)。

## 文本排版

海报生成器集成了 [Pretext](https://github.com/chenglou/pretext) 文本引擎，实现精确的服务端文本测量：

- **`--auto-fit`** — 自动调整标题字号以填满可用空间
- **`--balanced`** — 均衡行宽，实现视觉平衡的折行效果
- **`--shrink-wrap`** — 将画布宽度收窄至标题实际宽度
- **`--strict`** — 文本溢出时中止而非仅告警

排版诊断命令：

| 命令 | 说明 |
|------|------|
| `js-vi measure` | 测量指定模板/尺寸下的文本排版数据 |
| `js-vi typeset` | 跨尺寸扫描并建议 auto-fit 字号 |
| `js-vi best-size` | 根据内容推荐最佳海报尺寸 |
| `js-vi lint` | 批量校验配置文件中的文本溢出（适用于 CI） |

每个模板的 `meta.json` 定义了 `textLayout` 约束（font、lineHeight、maxWidth、maxHeight），供这些工具使用。

## 品牌色

| 颜色 | 色值 | 象征 |
|------|------|------|
| JS 黄 | `#FCD228` | 势（Momentum）、能量、注意力 |
| 黑色 | `#000000` | 清醒冷峻、结构、道 |
| 白色 | `#FFFFFF` | 纯粹、空间、无为 |

## 设计原则

- **新粗野主义**：硬边框、硬阴影、无圆角
- **高对比**：黑/黄/白 — 最大可见度
- **功能至上**：每个元素都有目的，不做装饰

### 禁用

渐变、圆角、柔和阴影、pastel 色、装饰性元素。

## 构建

```bash
# 从 Token JSON 重新生成 CSS 和 Tailwind 预设
npm run build

# 预览品牌手册
npm run preview
```

## 许可证

MIT

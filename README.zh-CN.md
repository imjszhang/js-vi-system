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
cli/             Commander 命令（poster、templates、build、init）
core/            模板引擎、渲染与配置
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

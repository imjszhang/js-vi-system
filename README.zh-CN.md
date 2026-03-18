# JS 视觉身份系统

**JS** 品牌的唯一权威来源 — 基于 **Neo-Brutalism + Cyberpunk** 美学的设计 Token、组件样式和品牌规范。

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

## 结构

```
tokens/          设计 Token（JSON）— 唯一权威来源
css/             生成产物：tokens.css、brutal.css、tailwind-preset.js
assets/          Logo SVG、字体引用
brand/           品牌哲学、身份、设计原则
character/       Cyber-Taoist 人物形象规格
voice/           调性、风格、语言规范
preview/         交互式品牌手册（打开 index.html）
build/           Token → CSS/JS 生成脚本
```

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

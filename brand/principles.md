# Design Principles

## Core Style

**Neo-Brutalism + Cyberpunk**

A high-voltage visual system designed for maximum impact. No blurred lines. No soft shadows. Just pure function.

## Principles

### 1. Hard Clarity (硬边界、确定性)

Every element has a decisive edge. Borders are `3px solid black`. Shadows are flat and offset. No ambiguity.

### 2. High Contrast (高对比)

Three colors dominate: Yellow (`#FCD228`), Black (`#000000`), White (`#FFFFFF`). Maximum visibility, maximum tension.

### 3. Function Over Decoration (功能至上)

Every element serves a purpose. Typography is uppercase and bold because it commands attention, not because it looks pretty.

### 4. Systematic Structure (系统思维)

The 50px technical grid is the structural backbone. Spacing follows a consistent 4px base scale. Components share a unified border-shadow interaction pattern.

### 5. Decisive Interaction (决断力)

Hover states respond instantly (`0.1s`). Elements physically "press in" via `translate(2px, 2px)` with shadow reduction. No subtle fades or hesitation.

## The Hard/Soft Tension

| Layer | Expression | Character |
|-------|-----------|-----------|
| **Environment** (UI) | Neo-Brutalist — square, sharp, thick | Hard |
| **Character** (avatar) | Organic curves — flowing, smooth | Soft |
| **Hair** (detail) | Spiky upright — sharp, angular | Hard |
| **Energy Core** (detail) | Pulsing glow — alive, radiating | Soft |

This collision of hard and soft IS the visual manifestation of Cyber-Taoist philosophy.

## Prohibited (禁用清单)

The following are **never** used in JS brand materials:

| Prohibited | Reason |
|-----------|--------|
| Gradients | Ambiguity contradicts clarity |
| Rounded corners | Softness contradicts decisive edges |
| Soft/blur shadows | Vagueness contradicts hard shadow system |
| Pastel colors | Weakness contradicts high-energy yellow |
| Decorative elements | Noise contradicts functional purity |
| Thin/hairline borders | Timidity contradicts bold assertion |

### Sole Exceptions

- The **Logo** is a circle (the shape itself, not a rounded rectangle)
- The **Loading spinner** uses `border-radius: 50%` (functional necessity)
- **Terminal dots** use `border-radius: 50%` (mimicking real terminal UI)

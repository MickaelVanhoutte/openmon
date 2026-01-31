# CSS Design System Usage - OpenMon

Generated: 2026-01-30

## Summary

| Metric                             | Count     |
| ---------------------------------- | --------- |
| Design tokens defined              | 26        |
| Design token usages in components  | **1**     |
| Hardcoded hex colors in components | **~450+** |
| Design System Adoption Rate        | **~0.2%** |

**This confirms the research finding: "Design system exists but only 1 component uses it!"**

---

## Design Tokens (from \_pixel-art.scss)

### Primary Colors

| Token                    | Value   | Usage Count |
| ------------------------ | ------- | ----------- |
| `--pixel-bg-primary`     | #1c4b72 | ~0          |
| `--pixel-bg-header`      | #0088cc | ~0          |
| `--pixel-bg-panel`       | #143855 | ~0          |
| `--pixel-bg-button`      | #334455 | ~0          |
| `--pixel-bg-button-dark` | #0d2538 | ~0          |

### Text Colors

| Token                    | Value   | Usage Count |
| ------------------------ | ------- | ----------- |
| `--pixel-text-white`     | #ffffff | ~0          |
| `--pixel-text-gold`      | #ffd700 | ~0          |
| `--pixel-text-secondary` | #aaccff | ~0          |
| `--pixel-text-stat-red`  | #ff4444 | ~0          |
| `--pixel-text-stat-blue` | #4488ff | ~0          |
| `--pixel-text-iv-green`  | #00ff00 | ~0          |

### Borders & Shadows

| Token                  | Value           | Usage Count |
| ---------------------- | --------------- | ----------- |
| `--pixel-border-color` | #000000         | ~0          |
| `--pixel-border-alt`   | #0d2538         | ~0          |
| `--pixel-shadow-color` | rgba(0,0,0,0.4) | ~0          |

### Legacy Aliases

| Token                  | Alias For              |
| ---------------------- | ---------------------- |
| `--pixel-panel-bg`     | --pixel-bg-panel       |
| `--pixel-panel-border` | --pixel-border-color   |
| `--pixel-panel-light`  | --pixel-text-white     |
| `--pixel-accent-gold`  | --pixel-text-gold      |
| `--pixel-accent-red`   | --pixel-text-stat-red  |
| `--pixel-accent-blue`  | --pixel-text-stat-blue |

### Shadows

| Token                  | Value                                 |
| ---------------------- | ------------------------------------- |
| `--pixel-shadow`       | 4px 4px 0px var(--pixel-shadow-color) |
| `--pixel-shadow-sm`    | 2px 2px 0px var(--pixel-shadow-color) |
| `--pixel-shadow-dark`  | 4px 4px 0px #000                      |
| `--pixel-shadow-inset` | inset 2px 2px 0 rgba(0,0,0,0.3)       |

### Sizing & Typography

| Token                      | Value |
| -------------------------- | ----- |
| `--pixel-line-height`      | 1.6   |
| `--pixel-line-height-list` | 1.8   |
| `--pixel-touch-target`     | 44px  |
| `--pixel-border-width`     | 2px   |
| `--pixel-border-radius`    | 0px   |

---

## Hardcoded Colors (Top 25)

| Color     | Count | Notes                            |
| --------- | ----- | -------------------------------- |
| `#000`    | 135   | Should be `--pixel-border-color` |
| `#ffd700` | 37    | Should be `--pixel-text-gold`    |
| `#143855` | 32    | Should be `--pixel-bg-panel`     |
| `#fff`    | 29    | Should be `--pixel-text-white`   |
| `#ffffff` | 26    | Should be `--pixel-text-white`   |
| `#0088cc` | 19    | Should be `--pixel-bg-header`    |
| `#68c0c8` | 11    | Custom color (no token)          |
| `#1c4b72` | 11    | Should be `--pixel-bg-primary`   |
| `#334455` | 8     | Should be `--pixel-bg-button`    |
| `#0d2538` | 8     | Should be `--pixel-border-alt`   |
| `#ececec` | 7     | Custom color (no token)          |
| `#e876ac` | 6     | Type color (no token needed)     |
| `#01a9da` | 6     | Type color                       |
| `#00a658` | 6     | Type color                       |
| `#dc5959` | 5     | Status color                     |
| `#F8D030` | 5     | Type color                       |
| `#4444dd` | 5     | Type color                       |
| `#f4e90e` | 4     | Custom color                     |
| `#aaa`    | 4     | Disabled state                   |
| `#595b59` | 4     | Custom color                     |
| `#262626` | 4     | Dark variant                     |
| `#0f3460` | 4     | Custom color                     |
| `#fb607c` | 3     | Type color                       |
| `#7f7fef` | 3     | Type color                       |
| `#54506c` | 3     | Custom color                     |

**Total hardcoded colors: ~450+ instances**

---

## Available Mixins (unused)

The design system provides these mixins that components should use:

| Mixin                             | Purpose                          |
| --------------------------------- | -------------------------------- |
| `@include pixel-border()`         | Standard pixel border            |
| `@include pixel-panel()`          | Panel with shadow                |
| `@include pixel-header()`         | Header bar style                 |
| `@include two-tone-bg()`          | 50/50 split background           |
| `@include pixel-tab-active()`     | Active tab indicator             |
| `@include pixel-tab-inactive()`   | Inactive tab                     |
| `@include pixel-button()`         | Button with hover/active states  |
| `@include pixel-selection-gold()` | Gold selection border with pulse |
| `@include pixel-stat-bar()`       | Stat bar capsule style           |

---

## Available Utility Classes (unused)

| Class                   | Purpose               |
| ----------------------- | --------------------- |
| `.pixel-panel`          | Panel styling         |
| `.pixel-header`         | Header styling        |
| `.pixel-button`         | Button styling        |
| `.pixel-text-list`      | List line height      |
| `.pixel-selection`      | Gold selection border |
| `.pixel-text-gold`      | Gold text color       |
| `.pixel-text-stat-up`   | Stat increase color   |
| `.pixel-text-stat-down` | Stat decrease color   |
| `.pixel-text-iv`        | IV highlight color    |
| `.pixel-scrollable`     | Hide scrollbars       |
| `.pixel-scrollbar`      | Custom scrollbar      |

---

## Migration Strategy (Phase 4)

1. **High Impact Colors** (>10 occurrences):
   - `#000` → `var(--pixel-border-color)` (135 instances)
   - `#ffd700` → `var(--pixel-text-gold)` (37 instances)
   - `#143855` → `var(--pixel-bg-panel)` (32 instances)
   - `#fff/#ffffff` → `var(--pixel-text-white)` (55 instances)
   - `#0088cc` → `var(--pixel-bg-header)` (19 instances)

2. **Keep As-Is** (Type-specific colors):
   - Pokemon type colors (#e876ac, #01a9da, etc.)
   - Status effect colors
   - Custom UI accents with no semantic meaning

3. **Consider Adding Tokens** (frequently used custom colors):
   - `#68c0c8` - 11 uses
   - `#ececec` - 7 uses

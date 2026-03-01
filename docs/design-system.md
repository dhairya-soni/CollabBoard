# Design System

CollabBoard follows a strict design system inspired by **Linear** and **Vercel**.

---

## Color Palette (Slate/Indigo)

### Dark Mode (Default)

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0f172a` (slate-950) | Page backgrounds |
| `surface` | `#1e293b` (slate-900) | Cards, panels, sidebar |
| `surface-light` | `#334155` (slate-800) | Hover states, dividers |
| `primary` | `#6366f1` (indigo-500) | Primary actions, links, active states |
| `primary-hover` | `#818cf8` (indigo-400) | Primary button hover |
| `secondary` | `#8b5cf6` (violet-500) | Secondary accents |
| `success` | `#10b981` (emerald-500) | Success states, active badges |
| `warning` | `#f59e0b` (amber-500) | Warning states |
| `danger` | `#f43f5e` (rose-500) | Destructive actions, errors |
| `text-primary` | `#f1f5f9` (slate-100) | Main text |
| `text-secondary` | `#94a3b8` (slate-400) | Muted text, labels |
| `border` | `#1e293b` (slate-800) | Subtle borders |

### Light Mode

| Token | Hex |
|-------|-----|
| `background` | `#f8fafc` |
| `surface` | `#ffffff` |
| `surface-light` | `#f1f5f9` |
| `text-primary` | `#0f172a` |
| `text-secondary` | `#64748b` |
| `border` | `#e2e8f0` |

Light mode is activated by adding the `.light` class to `<html>`.

---

## Typography

| Level | Font | Class |
|-------|------|-------|
| Page title | Inter 600 | `text-2xl font-semibold text-text-primary` |
| Section label | Inter 500 | `text-sm font-medium text-text-secondary uppercase tracking-wider` |
| Body | Inter 400 | `text-sm text-text-primary` |
| Small / metadata | Inter 400 | `text-xs text-text-secondary` |
| Monospace (IDs, timestamps) | JetBrains Mono | `font-mono text-sm text-text-secondary` |

**Fonts loaded via Google Fonts:**  
- Inter: weights 400, 500, 600  
- JetBrains Mono: weights 400, 500

---

## Spacing (4px Grid — Strict)

**Never use arbitrary values** like `w-[123px]`.

Allowed spacing values: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

| Context | Value |
|---------|-------|
| Card padding | `p-6` (24px) |
| Gap between items | `gap-3` (12px) or `gap-4` (16px) |
| Section spacing | `space-y-8` or `space-y-12` |

---

## Icons

- **Only use** `lucide-react`
- Standard size: `h-4 w-4` (16px)
- Large icons (empty states): `h-12 w-12`
- **No emojis as UI elements**

---

## Animation Standards (Framer Motion)

| Animation | Config |
|-----------|--------|
| Page enter | `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}` |
| List items | `staggerChildren: 0.05` |
| Hover | Color transitions only — **never scale transforms on buttons** |
| Loading | Skeleton pulse — **never spinners for content loading** |

---

## Component Patterns

### Button Primary
```
bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
```

### Button Secondary
```
bg-surface-light hover:bg-surface text-text-primary px-4 py-2 rounded-lg font-medium border border-border transition-colors
```

### Card
```
bg-surface border border-border rounded-xl shadow-lg shadow-black/20 hover:border-surface-light transition-colors
```

### Input
```
bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
```

# Folder Structure

## Root

```
CollabBoard/
├── client/          # Frontend (React + Vite)
├── server/          # Backend (Express + Prisma) — Phase 1+
├── docs/            # Project documentation
└── readme.md        # Master project README & build prompt
```

## Client (Frontend)

```
client/
├── index.html                     # Entry HTML (loads fonts, root div)
├── package.json                   # Frontend dependencies & scripts
├── tsconfig.json                  # TypeScript config with @/ path alias
├── vite.config.ts                 # Vite config (React plugin, Tailwind, proxy)
├── public/
│   └── favicon.svg                # App icon
└── src/
    ├── main.tsx                   # React root (BrowserRouter + StrictMode)
    ├── App.tsx                    # Route definitions
    ├── index.css                  # Tailwind v4 @theme config + global styles
    ├── lib/
    │   └── utils.ts               # cn() helper (clsx + tailwind-merge)
    ├── hooks/
    │   └── useTheme.ts            # Dark/light mode hook (localStorage + system pref)
    ├── components/
    │   ├── ui/                    # Design system primitives
    │   │   ├── Button.tsx         # Variants: primary, secondary, ghost, danger
    │   │   ├── Card.tsx           # Card, CardHeader, CardContent, CardFooter
    │   │   ├── Input.tsx          # Input + Textarea
    │   │   ├── Badge.tsx          # Status badges
    │   │   ├── Avatar.tsx         # Image + initials fallback
    │   │   ├── Skeleton.tsx       # Loading placeholder
    │   │   ├── EmptyState.tsx     # Icon + title + description + action
    │   │   ├── Tooltip.tsx        # Radix UI tooltip
    │   │   ├── Dialog.tsx         # Radix UI modal
    │   │   ├── DropdownMenu.tsx   # Radix UI context menu
    │   │   └── index.ts           # Barrel exports
    │   └── layout/
    │       ├── AppShell.tsx       # Sidebar + Header + Outlet wrapper
    │       ├── Sidebar.tsx        # Collapsible nav (icon rail on collapse, drawer on mobile)
    │       ├── Header.tsx         # Breadcrumbs + search + notifications
    │       └── ThemeToggle.tsx    # Dark/light switch button
    └── pages/
        ├── Dashboard.tsx          # Home page with stats
        └── DesignSystem.tsx       # Component showcase (/design-system)
```

## Server (Backend — Phase 1+)

```
server/                            # Created in Phase 1
├── src/
│   ├── index.ts                   # Express server entry
│   ├── routes/                    # API route handlers
│   ├── middleware/                 # Auth, error handling, validation
│   ├── services/                  # Business logic
│   └── lib/                       # Shared utilities
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed script
├── package.json
└── tsconfig.json
```

## Docs

```
docs/
├── README.md                      # Documentation index
├── project-overview.md            # What, why, who
├── tech-stack.md                  # Complete tech stack table
├── design-system.md               # Colors, typography, spacing, patterns
├── folder-structure.md            # This file
├── phase-roadmap.md               # 8-phase build plan
├── component-api.md               # Component props & usage
└── workflow-rules.md              # Dev workflow & review gates
```

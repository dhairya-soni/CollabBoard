# Technology Stack

All technology choices are **locked** — no substitutions without explicit approval.

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first CSS (CSS-first config with `@theme`) |
| Framer Motion | 12.x | Animations & transitions |
| Zustand | — | Client-side state management |
| TanStack Query | — | Server state, caching, data fetching |
| React Router | 7.x | Client-side routing |

## UI Primitives

| Library | Purpose |
|---------|---------|
| Radix UI | Accessible unstyled primitives (Tooltip, Dialog, DropdownMenu) |
| Lucide React | Icon library (only icon source allowed) |
| clsx + tailwind-merge | Conditional class merging via `cn()` utility |

## Backend

| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| TypeScript | Type safety across backend |
| Prisma ORM | Database access layer & migrations |
| PostgreSQL | Primary database |
| Zod | Request validation |

## Real-Time

| Technology | Purpose |
|-----------|---------|
| Socket.io | WebSocket communication |
| Redis | Socket.io adapter for horizontal scaling |

## Authentication

| Technology | Purpose |
|-----------|---------|
| Clerk (preferred) or Auth0 | Authentication & user management |

## File Storage

| Technology | Purpose |
|-----------|---------|
| Cloudinary or AWS S3 | Image/file uploads |

## Testing

| Technology | Purpose |
|-----------|---------|
| Vitest | Unit testing |
| Playwright | End-to-end testing |

## DevOps & Monitoring

| Technology | Purpose |
|-----------|---------|
| Docker Compose | Local development environment |
| GitHub Actions | CI/CD pipeline |
| Vercel | Frontend deployment |
| Railway / Render | Backend deployment |
| Supabase | Hosted PostgreSQL |
| Upstash | Hosted Redis |
| Sentry | Error monitoring |
| PostHog / Plausible | Privacy-friendly analytics |

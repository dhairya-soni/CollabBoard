# Component API Reference

All UI components live in `client/src/components/ui/` and are exported from the barrel `index.ts`.

---

## Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" leftIcon={<Plus />} isLoading={false}>
  Create Task
</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows spinner, disables button |
| `leftIcon` | `ReactNode` | — | Icon before text |
| `rightIcon` | `ReactNode` | — | Icon after text |
| + all `<button>` HTML attributes |

---

## Card, CardHeader, CardContent, CardFooter

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader><h3>Title</h3></CardHeader>
  <CardContent><p>Body content</p></CardContent>
  <CardFooter><Badge>Active</Badge></CardFooter>
</Card>
```

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional Tailwind classes |
| `children` | `ReactNode` | Slot content |

---

## Input

```tsx
import { Input } from '@/components/ui';

<Input label="Email" placeholder="you@example.com" error="Invalid email" leftIcon={<Mail />} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label above input |
| `error` | `string` | — | Error message below input (turns border red) |
| `leftIcon` | `ReactNode` | — | Icon inside input on the left |
| + all `<input>` HTML attributes |

---

## Textarea

```tsx
import { Textarea } from '@/components/ui';

<Textarea label="Description" placeholder="Add details..." rows={4} error="Required" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label above textarea |
| `error` | `string` | — | Error message |
| + all `<textarea>` HTML attributes |

---

## Badge

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color variant |

---

## Avatar

```tsx
import { Avatar } from '@/components/ui';

<Avatar name="John Doe" size="md" src="https://..." />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | **required** | Used for fallback initials + title |
| `src` | `string` | — | Image URL (falls back to initials on error) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar size (24/32/40px) |

---

## Skeleton

```tsx
import { Skeleton } from '@/components/ui';

<Skeleton className="h-4 w-1/3" />
<Skeleton className="h-32 w-full rounded-lg" />
```

Control dimensions via Tailwind `className`. Uses pulse animation.

---

## EmptyState

```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  title="No projects yet"
  description="Create your first project."
  icon={<FolderKanban className="h-12 w-12 opacity-40" />}
  action={{ label: 'Create', onClick: () => {} }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Heading text |
| `description` | `string` | — | Supporting text |
| `icon` | `ReactNode` | Inbox icon | Custom icon |
| `action` | `{ label, onClick }` | — | CTA button |

---

## Tooltip

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip content="Create a new task" side="bottom">
  <Button>+</Button>
</Tooltip>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | **required** | Tooltip text |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Placement |
| `delayDuration` | `number` | `200` | Show delay in ms |
| `children` | `ReactNode` | **required** | Trigger element |

---

## Dialog

```tsx
import { Dialog } from '@/components/ui';

<Dialog open={open} onOpenChange={setOpen} title="Confirm" description="Are you sure?">
  <Button onClick={() => setOpen(false)}>Yes</Button>
</Dialog>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | **required** | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | **required** | State setter |
| `title` | `string` | **required** | Dialog heading |
| `description` | `string` | — | Sub-heading |
| `children` | `ReactNode` | **required** | Dialog body |

---

## DropdownMenu

```tsx
import { DropdownMenu } from '@/components/ui';

<DropdownMenu
  trigger={<Button>Actions</Button>}
  items={[
    { label: 'Edit', icon: <Edit />, onClick: handleEdit },
    { label: 'Delete', icon: <Trash />, onClick: handleDelete, variant: 'danger' },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | **required** | Element that opens the menu |
| `items` | `DropdownMenuItem[]` | **required** | Menu items |
| `align` | `'start' \| 'center' \| 'end'` | `'end'` | Menu alignment |

**DropdownMenuItem:**

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Item text |
| `icon` | `ReactNode` | Optional icon |
| `onClick` | `() => void` | Click handler |
| `variant` | `'default' \| 'danger'` | Color variant |

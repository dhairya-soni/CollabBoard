import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Badge,
  Avatar,
  Skeleton,
  EmptyState,
  Tooltip,
  Dialog,
  DropdownMenu,
} from '@/components/ui';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  FolderKanban,
  Zap,
  Star,
} from 'lucide-react';

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

/* ── Section Wrapper ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section variants={itemVariants} className="space-y-4">
      <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

/* ── Design System Page ── */
function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold text-text-primary">Design System</h1>
        <p className="text-sm text-text-secondary mt-1">
          CollabBoard component library — all tokens and patterns in one place.
        </p>
      </motion.div>

      {/* ── Colors ── */}
      <Section title="Color Palette">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { name: 'Background', color: 'bg-background', border: true },
            { name: 'Surface', color: 'bg-surface', border: true },
            { name: 'Surface Light', color: 'bg-surface-light' },
            { name: 'Primary', color: 'bg-primary' },
            { name: 'Primary Hover', color: 'bg-primary-hover' },
            { name: 'Secondary', color: 'bg-secondary' },
            { name: 'Success', color: 'bg-success' },
            { name: 'Warning', color: 'bg-warning' },
            { name: 'Danger', color: 'bg-danger' },
            { name: 'Text Primary', color: 'bg-text-primary' },
            { name: 'Text Secondary', color: 'bg-text-secondary' },
            { name: 'Border', color: 'bg-border', border: true },
          ].map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-2">
              <div
                className={`h-12 w-full rounded-lg ${c.color} ${c.border ? 'border border-surface-light' : ''}`}
              />
              <span className="text-xs text-text-secondary">{c.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-text-secondary font-mono">text-2xl font-semibold</span>
              <p className="text-2xl font-semibold text-text-primary">Page Title — Inter Semibold</p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-mono">text-sm font-medium uppercase tracking-wider</span>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Section Label</p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-mono">text-sm text-text-primary</span>
              <p className="text-sm text-text-primary">Body text — The quick brown fox jumps over the lazy dog.</p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-mono">text-xs text-text-secondary</span>
              <p className="text-xs text-text-secondary">Small text — Metadata, timestamps, and helper labels.</p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-mono">font-mono</span>
              <p className="text-sm font-mono text-text-secondary">TASK-2847 • 2024-01-15 14:30</p>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons">
        <Card>
          <CardContent className="space-y-6">
            {/* Variants */}
            <div>
              <p className="text-xs text-text-secondary mb-3">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-xs text-text-secondary mb-3">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <p className="text-xs text-text-secondary mb-3">With Icons</p>
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<Plus className="h-4 w-4" />}>Create Task</Button>
                <Button variant="secondary" leftIcon={<Search className="h-4 w-4" />}>
                  Search
                </Button>
                <Button variant="ghost" leftIcon={<Star className="h-4 w-4" />}>
                  Favorite
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <p className="text-xs text-text-secondary mb-3">States</p>
              <div className="flex flex-wrap gap-3">
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Cards ── */}
      <Section title="Cards">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold text-text-primary">Project Alpha</h3>
              <p className="text-xs text-text-secondary">Created Jan 15, 2026</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                A collaborative workspace for the frontend team. Contains 24 tasks across 4 columns.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Badge variant="success">Active</Badge>
              <Badge>12 tasks</Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold text-text-primary">Design Sprint</h3>
              <p className="text-xs text-text-secondary">Created Feb 1, 2026</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                Weekly design sprint board with automatic archiving and review workflow.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Badge variant="warning">In Review</Badge>
              <Badge>8 tasks</Badge>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* ── Inputs ── */}
      <Section title="Inputs">
        <Card>
          <CardContent className="space-y-4 max-w-md">
            <Input
              label="Project Name"
              placeholder="Enter project name..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="Search"
              placeholder="Search tasks..."
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Input
              label="With Error"
              placeholder="Invalid email"
              error="Please enter a valid email address."
              defaultValue="not-an-email"
            />
            <Textarea
              label="Description"
              placeholder="Add a detailed description..."
              rows={3}
            />
          </CardContent>
        </Card>
      </Section>

      {/* ── Badges ── */}
      <Section title="Badges">
        <Card>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Avatars ── */}
      <Section title="Avatars">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Avatar name="John Doe" size="sm" />
                <span className="text-xs text-text-secondary mt-1 block">SM</span>
              </div>
              <div className="text-center">
                <Avatar name="Jane Smith" size="md" />
                <span className="text-xs text-text-secondary mt-1 block">MD</span>
              </div>
              <div className="text-center">
                <Avatar name="Alex Johnson" size="lg" />
                <span className="text-xs text-text-secondary mt-1 block">LG</span>
              </div>
              <div className="text-center">
                <Avatar
                  name="Profile Photo"
                  size="lg"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=CollabBoard"
                />
                <span className="text-xs text-text-secondary mt-1 block">With Image</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Skeletons ── */}
      <Section title="Loading Skeletons">
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </CardContent>
        </Card>
      </Section>

      {/* ── Empty State ── */}
      <Section title="Empty State">
        <Card>
          <EmptyState
            title="No projects yet"
            description="Create your first project and start collaborating with your team."
            icon={<FolderKanban className="h-12 w-12 mx-auto opacity-40" />}
            action={{
              label: 'Create Project',
              onClick: () => alert('Create project clicked!'),
            }}
          />
        </Card>
      </Section>

      {/* ── Tooltip ── */}
      <Section title="Tooltip">
        <Card>
          <CardContent>
            <div className="flex gap-4">
              <Tooltip content="This creates a new task" side="top">
                <Button variant="secondary" leftIcon={<Zap className="h-4 w-4" />}>
                  Hover me (top)
                </Button>
              </Tooltip>
              <Tooltip content="Opens quick actions" side="right">
                <Button variant="ghost" leftIcon={<MoreHorizontal className="h-4 w-4" />}>
                  Hover me (right)
                </Button>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Dialog ── */}
      <Section title="Dialog / Modal">
        <Card>
          <CardContent>
            <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="Create New Project"
              description="Enter the details for your new project."
            >
              <div className="space-y-4">
                <Input label="Project Name" placeholder="My awesome project" />
                <Textarea label="Description" placeholder="What's this project about?" rows={3} />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>Create</Button>
                </div>
              </div>
            </Dialog>
          </CardContent>
        </Card>
      </Section>

      {/* ── Dropdown Menu ── */}
      <Section title="Dropdown Menu">
        <Card>
          <CardContent>
            <DropdownMenu
              trigger={
                <Button variant="secondary" leftIcon={<MoreHorizontal className="h-4 w-4" />}>
                  Actions
                </Button>
              }
              items={[
                { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: () => alert('Edit') },
                { label: 'Duplicate', icon: <Copy className="h-4 w-4" />, onClick: () => alert('Duplicate') },
                {
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => alert('Delete'),
                  variant: 'danger',
                },
              ]}
            />
          </CardContent>
        </Card>
      </Section>

      {/* ── Animation Demo ── */}
      <Section title="Animation (Framer Motion)">
        <Card>
          <CardContent>
            <p className="text-xs text-text-secondary mb-4">
              Staggered list animation — this entire page uses it. Individual items fade in + slide up.
            </p>
            <div className="flex gap-3">
              {['To Do', 'In Progress', 'Review', 'Done'].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.08 }}
                  className="bg-surface-light rounded-lg px-4 py-2 text-sm text-text-primary"
                >
                  {label}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>
    </motion.div>
  );
}

export default DesignSystemPage;

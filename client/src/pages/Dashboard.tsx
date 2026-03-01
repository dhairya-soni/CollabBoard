import { motion } from 'framer-motion';
import { Card, CardContent, Button } from '@/components/ui';
import { FolderKanban, Users, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function DashboardPage() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Welcome back! Here&apos;s what&apos;s happening across your workspaces.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Projects', value: '—', icon: FolderKanban },
          { label: 'Team Members', value: '—', icon: Users },
          { label: 'Tasks Completed', value: '—', icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">{stat.label}</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Design System Link */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Design System
            </h3>
            <p className="text-sm text-text-secondary">
              View all UI components, tokens, and patterns.
            </p>
          </div>
          <Link to="/design-system">
            <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DashboardPage;

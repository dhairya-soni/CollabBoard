import { motion } from 'framer-motion';
import { Card, CardContent, Button } from '@/components/ui';
import { FolderKanban, Users, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function DashboardPage() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-xs text-text-secondary mt-1">
          Welcome back! Here&apos;s what&apos;s happening across your workspaces.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Active Projects', value: '12', icon: FolderKanban },
          { label: 'Team Members', value: '5', icon: Users },
          { label: 'Tasks Completed', value: '48', icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className="h-3.5 w-3.5 text-text-tertiary" />
                <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Design System Link */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Design System
            </h3>
            <p className="text-xs text-text-secondary">
              View all UI components, tokens, and patterns.
            </p>
          </div>
          <Link to="/design-system">
            <Button variant="secondary" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              View
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DashboardPage;

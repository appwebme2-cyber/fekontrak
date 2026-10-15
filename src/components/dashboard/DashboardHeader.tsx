
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Activity, Target, LayoutDashboard } from 'lucide-react';

interface DashboardHeaderProps {
  metrics: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    pendingContracts: number;
  };
}

export const DashboardHeader = ({ metrics }: DashboardHeaderProps) => {
  return (
    <div className="animate-fade-in-scale">
      <PageHeader
        icon={LayoutDashboard}
        title="Executive Dashboard"
        description="High-level overview of contract metrics and financial performance"
        actions={
          <Link to="/contract-performance">
            <Button variant="outline" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance Monitoring
            </Button>
          </Link>
        }
      />
    </div>
  );
};

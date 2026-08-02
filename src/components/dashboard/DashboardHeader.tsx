
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Activity, Target } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Executive Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">High-level overview of contract metrics and financial performance</p>
        </div>
        <div className="flex gap-2">
          <Link to="/contract-performance">
            <Button variant="outline" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance Monitoring
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

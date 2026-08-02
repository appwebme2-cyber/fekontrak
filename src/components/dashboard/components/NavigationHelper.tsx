import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Activity, Target, Info } from 'lucide-react';

export const NavigationHelper = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Navigation Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Executive Dashboard
            </h4>
            <p className="text-sm text-muted-foreground">
              High-level overview for management with financial analytics, status charts, and KPI metrics
            </p>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                View Executive Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance Monitoring
            </h4>
            <p className="text-sm text-muted-foreground">
              Operational control panel for SLA compliance, progress deviations, and detailed contract monitoring
            </p>
            <Link to="/contract-performance">
              <Button variant="outline" size="sm">
                View Performance Monitoring
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
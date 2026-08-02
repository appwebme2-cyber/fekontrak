
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Plus, TrendingUp, Calendar as CalendarIcon, User, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const progressData = [
  {
    contractId: 'CNT-001',
    vendor: 'ABC Industrial Services',
    description: 'Maintenance of Process Units',
    currentProgress: 75,
    lastUpdate: '2024-06-10',
    supervisor: 'John Smith',
    status: 'On Track'
  },
  {
    contractId: 'CNT-002',
    vendor: 'XYZ Technical Solutions',
    description: 'Instrumentation Upgrade',
    currentProgress: 45,
    lastUpdate: '2024-06-08',
    supervisor: 'Jane Doe',
    status: 'Behind Schedule'
  },
  {
    contractId: 'CNT-003',
    vendor: 'Industrial Maintenance Corp',
    description: 'Pipe Replacement Project',
    currentProgress: 90,
    lastUpdate: '2024-06-12',
    supervisor: 'Mike Johnson',
    status: 'Ahead of Schedule'
  }
];

const progressLogs = [
  {
    id: 1,
    contractId: 'CNT-001',
    previousProgress: 65,
    newProgress: 75,
    updateDate: '2024-06-10',
    supervisor: 'John Smith',
    notes: 'Completed installation of new pumps in Unit A-1',
    basedOnBAST: true
  },
  {
    id: 2,
    contractId: 'CNT-002',
    previousProgress: 35,
    newProgress: 45,
    updateDate: '2024-06-08',
    supervisor: 'Jane Doe',
    notes: 'Control panel wiring completed, testing in progress',
    basedOnBAST: false
  },
  {
    id: 3,
    contractId: 'CNT-003',
    previousProgress: 80,
    newProgress: 90,
    updateDate: '2024-06-12',
    supervisor: 'Mike Johnson',
    notes: 'Final welding work completed, pressure testing passed',
    basedOnBAST: true
  }
];

const WorkProgress = () => {
  const [updateDate, setUpdateDate] = useState<Date>();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      'On Track': 'default',
      'Behind Schedule': 'destructive',
      'Ahead of Schedule': 'default'
    } as const;
    
    const colors = {
      'On Track': 'bg-green-100 text-green-800',
      'Behind Schedule': 'bg-red-100 text-red-800',
      'Ahead of Schedule': 'bg-blue-100 text-blue-800'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Progress</h1>
          <p className="text-muted-foreground">
            Monitor and update contract work progress
          </p>
        </div>
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Update Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Work Progress</DialogTitle>
              <DialogDescription>
                Update the progress for a contract. Supervisor access required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Contract</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose contract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNT-001">CNT-001 - ABC Industrial</SelectItem>
                    <SelectItem value="CNT-002">CNT-002 - XYZ Technical</SelectItem>
                    <SelectItem value="CNT-003">CNT-003 - Industrial Corp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentProgress">Current Progress (%)</Label>
                <div className="text-sm text-muted-foreground">Current: 75%</div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newProgress">New Progress (%)</Label>
                <Input id="newProgress" type="number" min="0" max="100" placeholder="80" />
              </div>
              <div className="grid gap-2">
                <Label>Update Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !updateDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {updateDate ? format(updateDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={updateDate} onSelect={setUpdateDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Progress Notes</Label>
                <Textarea id="notes" placeholder="Describe the work completed..." />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="basedOnBAST" className="rounded" />
                <Label htmlFor="basedOnBAST" className="text-sm">Based on BAST (Berita Acara Serah Terima)</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsUpdateDialogOpen(false)}>Update Progress</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {progressData.map((contract) => (
          <Card key={contract.contractId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{contract.contractId}</CardTitle>
                {getStatusBadge(contract.status)}
              </div>
              <CardDescription>{contract.vendor}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">{contract.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-bold">{contract.currentProgress}%</span>
                </div>
                <Progress value={contract.currentProgress} className="h-3" />
              </div>

              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Supervisor:</span>
                  <span className="font-medium">{contract.supervisor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{contract.lastUpdate}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Log */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Update Log</CardTitle>
          <CardDescription>History of all progress updates with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Progress Change</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>BAST</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {progressLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.contractId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">{log.previousProgress}%</span>
                      <span>→</span>
                      <span className="font-bold text-green-600">{log.newProgress}%</span>
                      <span className="text-sm text-green-600">
                        (+{log.newProgress - log.previousProgress}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{log.updateDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {log.supervisor}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.basedOnBAST ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckSquare className="h-4 w-4" />
                        <span className="text-sm">Yes</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm truncate" title={log.notes}>
                      {log.notes}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkProgress;

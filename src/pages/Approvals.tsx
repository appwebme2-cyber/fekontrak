
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, Check, X, Clock, FileText, Receipt, User } from 'lucide-react';

const pendingApprovals = [
  {
    id: 'INV-002',
    type: 'Invoice',
    title: 'Payment Term 2 - ABC Industrial',
    amount: 150000,
    submittedBy: 'ABC Industrial Services',
    submissionDate: '2024-06-10',
    currentApprover: 'Jane Doe (Finance)',
    approvalLevel: 1,
    totalLevels: 2,
    description: 'Second payment term for maintenance contract'
  },
  {
    id: 'CNT-004',
    type: 'Contract',
    title: 'New Maintenance Contract',
    amount: 280000,
    submittedBy: 'John Smith',
    submissionDate: '2024-06-11',
    currentApprover: 'Mike Johnson (Operations)',
    approvalLevel: 1,
    totalLevels: 3,
    description: 'Annual maintenance contract for cooling systems'
  }
];

const approvalHistory = [
  {
    id: 'INV-001',
    type: 'Invoice',
    title: 'Payment Term 1 - ABC Industrial',
    amount: 75000,
    approvedBy: 'John Smith',
    approvalDate: '2024-06-05',
    status: 'Approved',
    comments: 'Work progress verified, payment approved'
  },
  {
    id: 'CNT-003',
    type: 'Contract',
    title: 'Pipe Replacement Extension',
    amount: 50000,
    approvedBy: 'Jane Doe',
    approvalDate: '2024-06-03',
    status: 'Approved',
    comments: 'Extension approved due to additional scope'
  },
  {
    id: 'INV-004',
    type: 'Invoice',
    title: 'Payment Term 3 - Industrial Corp',
    amount: 96000,
    approvedBy: 'Mike Johnson',
    approvalDate: '2024-06-02',
    status: 'Rejected',
    comments: 'Progress verification required before payment'
  }
];

const Approvals = () => {
  const getTypeBadge = (type: string) => {
    const colors = {
      'Invoice': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-green-100 text-green-800'
    } as const;

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">
          Manage multi-level approvals for contracts and invoices
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">8</div>
            <p className="text-xs text-muted-foreground">
              $425,000 total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Approval Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5</div>
            <p className="text-xs text-muted-foreground">
              Days average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items requiring your approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {approval.type === 'Invoice' ? (
                      <Receipt className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{approval.title}</h3>
                      {getTypeBadge(approval.type)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{approval.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>ID: {approval.id}</span>
                      <span>Amount: ${approval.amount.toLocaleString()}</span>
                      <span>Submitted: {approval.submissionDate}</span>
                      <span>Level: {approval.approvalLevel}/{approval.totalLevels}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Current: {approval.currentApprover}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Review {approval.type}</DialogTitle>
                        <DialogDescription>
                          {approval.title} - ${approval.amount.toLocaleString()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Details</Label>
                          <p className="text-sm text-muted-foreground">{approval.description}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="comments">Approval Comments</Label>
                          <Textarea id="comments" placeholder="Add your comments..." />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval History */}
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
          <CardDescription>Recent approval decisions and history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvalHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>${item.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {item.approvedBy}
                    </div>
                  </TableCell>
                  <TableCell>{item.approvalDate}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm truncate" title={item.comments}>
                      {item.comments}
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

export default Approvals;

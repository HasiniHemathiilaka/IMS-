import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Armchair, CheckCircle2, XCircle, Clock,
  Eye, Loader2
} from 'lucide-react';
import { InventoryRequest } from '@/lib/types';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '@/lib/services/request.service';
import { useAuth } from '@/contexts/AuthContext';
import RequestActionDialog from '@/components/common/RequestActionDialog';
import RequestHistoryTimeline from '@/components/requests/RequestHistoryTimeline';

const AdminRequests: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [actionRequest, setActionRequest] = useState<InventoryRequest | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', user?.departmentId],
    queryFn: () => {
      if (user?.role === 'ADMIN' || user?.role === 'IMO') {
        return requestApi.getAll();
      } else if (user?.departmentId) {
        return requestApi.getByDepartment(user.departmentId);
      }
      return Promise.resolve([]);
    },
    enabled: !!user,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, remarks }: { id: number, action: 'approve' | 'reject', remarks?: string }) => {
      const payload = {
        approve: action === 'approve',
        reason: action === 'reject' ? remarks : undefined
      };
      const request = requests.find(r => r.id === id);
      if (!request) throw new Error("Request not found");
      
      switch (request.status) {
        case 'PENDING_IN_CHARGE':
          return requestApi.inChargeDecision(id, payload);
        case 'PENDING_MA':
          return requestApi.maDecision(id, payload);
        case 'PENDING_HOD':
          return requestApi.hodDecision(id, payload);
        case 'PENDING_ADMIN':
          return requestApi.adminDecision(id, payload);
        case 'PENDING_WELFARE':
          return requestApi.welfareDecision(id, payload);
        default:
          throw new Error("Invalid request state for admin action");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return request.status.startsWith('PENDING_');
    if (activeTab === 'approved') return ['COMPLETED', 'PURCHASED'].includes(request.status);
    if (activeTab === 'rejected') return request.status === 'REJECTED';
    return true;
  });

  const pendingCount = requests.filter(request => request.status.startsWith('PENDING_')).length;

  const columns = [
    {
      key: 'id',
      header: 'Request #',
      sortable: true,
      cell: (request: InventoryRequest) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            request.itemType === 'CAPITAL' 
              ? "bg-primary/10 text-primary" 
              : "bg-accent/50 text-accent-foreground"
          )}>
            {request.itemType === 'CAPITAL' ? (
              <Package className="w-5 h-5" />
            ) : (
              <Armchair className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-medium">REQ-{request.id.toString().padStart(4, '0')}</p>
            <p className="text-xs text-muted-foreground">
              {request.quantity} unit(s)
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'requestedById',
      header: 'Requested By',
      cell: (request: InventoryRequest) => (
        <div>
          <p className="font-medium">UID-{request.requestedById}</p>
          <p className="text-xs text-muted-foreground">Dept ID: {request.departmentId}</p>
        </div>
      ),
    },
    {
      key: 'itemName',
      header: 'Item',
      cell: (request: InventoryRequest) => (
        <p className="font-medium">{request.itemName}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (request: InventoryRequest) => <StatusBadge status={request.status} />,
    },
    {
      key: 'requestDate',
      header: 'Date',
      sortable: true,
      cell: (request: InventoryRequest) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(request.requestDate), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (request: InventoryRequest) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedRequest(request)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {request.status.startsWith('PENDING_') && (
            <Button 
              size="sm"
              onClick={() => setActionRequest(request)}
              className="btn-primary-gradient"
            >
              Action
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold">Inventory Requests</h1>
        <p className="text-muted-foreground">
          Review and track all inventory requests. You manage Admin and Welfare approvals here.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-card">
            All Requests
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-card">
            <Clock className="w-4 h-4 mr-2" />
            Action Required ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-card">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-card">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                data={filteredRequests}
                columns={columns}
                searchPlaceholder="Search requests..."
                emptyMessage="No requests found"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RequestActionDialog
        isOpen={!!actionRequest}
        onClose={() => setActionRequest(null)}
        request={actionRequest}
        userRole={'ADMIN'}
        onAction={(id, action, remarks) => {
          actionMutation.mutate({ id, action, remarks });
        }}
      />

      {/* Standard View Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-serif text-xl">
                    REQ-{selectedRequest.id.toString().padStart(4, '0')}
                  </DialogTitle>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                <DialogDescription>
                  Submitted on {format(new Date(selectedRequest.requestDate), 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Requested By</p>
                    <p className="font-medium">UID-{selectedRequest.requestedById}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Department ID</p>
                    <Badge variant="outline">{selectedRequest.departmentId}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Item Type</p>
                    <Badge variant="outline">
                      {selectedRequest.itemType === 'CAPITAL' ? 'Capital Item' : 'Simple Item'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Item Details</h4>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="font-medium text-lg">{selectedRequest.itemName}</p>
                      <p className="text-sm text-muted-foreground mt-1">Quantity: {selectedRequest.quantity}</p>
                      {selectedRequest.specifications && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Specifications:</p>
                          <p className="text-sm text-muted-foreground">{selectedRequest.specifications}</p>
                        </div>
                      )}
                      {selectedRequest.purpose && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Purpose:</p>
                          <p className="text-sm text-muted-foreground">{selectedRequest.purpose}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Workflow Timeline</h4>
                    <div className="p-4 rounded-lg border bg-card">
                      <RequestHistoryTimeline history={selectedRequest.history || []} currentStatus={selectedRequest.status} />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminRequests;

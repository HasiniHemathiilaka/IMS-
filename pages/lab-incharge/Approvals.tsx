import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InventoryRequest } from '@/lib/types';
import StatusBadge from '@/components/common/StatusBadge';
import RequestActionDialog from '@/components/common/RequestActionDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '@/lib/services/request.service';
import { Loader2, ClipboardCheck } from 'lucide-react';

const LabInchargeApprovals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);

  // Fetch pending Lab In-Charge requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', 'PENDING_IN_CHARGE'],
    queryFn: async () => {
      const all = await requestApi.getPendingInCharge();
      // Filter by department if not admin
      if (user?.departmentId && user.role !== 'ADMIN') {
        return all.filter(r => r.departmentId === user.departmentId || String(r.departmentId) === String(user.departmentId));
      }
      return all;
    },
    enabled: !!user
  });

  // Action Mutations
  const actionMutation = useMutation({
    mutationFn: async ({ id, action, remarks }: { id: number, action: 'approve' | 'reject', remarks?: string }) => {
      const payload = {
        approve: action === 'approve',
        reason: action === 'reject' ? remarks : undefined
      };
      
      return requestApi.inChargeDecision(id, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: variables.action === 'approve' ? "Request Approved" : "Request Rejected",
        description: `Request ${variables.id} has been forwarded to MA.`,
        className: variables.action === 'approve' ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      });
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAction = (id: number, action: 'approve' | 'reject', remarks?: string) => {
    actionMutation.mutate({ id, action, remarks });
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-serif font-bold">Lab In-Charge Approvals</h1>
      </div>
      <p className="text-muted-foreground">Technical review of requests submitted by Lab TOs within your department.</p>

      <div className="grid gap-4">
        {requests.map(req => (
          <Card key={req.id} className="hover:border-primary/50 transition-colors shadow-sm overflow-hidden border-l-4 border-l-amber-400">
            <CardContent className="p-6 flex items-center justify-between">
               <div className="space-y-1">
                  <div className="flex items-center gap-3 mb-1">
                     <h3 className="font-bold text-lg">REQ-{req.id.toString().padStart(4, '0')}</h3>
                     <StatusBadge status={req.status} />
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{req.itemName} ({req.itemType})</span>
                    <span className="text-muted-foreground">Quantity: {req.quantity}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-secondary text-secondary-foreground uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                      Requester ID: {req.requestedById}
                    </span>
                  </div>
               </div>
               <Button onClick={() => setSelectedRequest(req)} className="btn-primary-gradient shadow-md">
                 Review & Decide
               </Button>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
           <div className="text-center py-20 bg-muted/30 border-2 border-dashed rounded-xl">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No pending requests for technical review.</p>
           </div>
        )}
      </div>

      <RequestActionDialog
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        userRole={'LAB_IN_CHARGE'}
        onAction={handleAction}
      />
    </div>
  );
};

export default LabInchargeApprovals;

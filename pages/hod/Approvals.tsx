import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InventoryRequest } from '@/lib/types';
import StatusBadge from '@/components/common/StatusBadge';
import RequestActionDialog from '@/components/common/RequestActionDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '@/lib/services/request.service';
import { Loader2 } from 'lucide-react';

const HODApprovals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);

  // Fetch pending HOD requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests', 'PENDING_HOD'],
    queryFn: async () => {
      const all = await requestApi.getPendingHOD();
      // Enforce department isolation
      if (user?.departmentId && user.role !== 'ADMIN') {
        return all.filter(r => r.departmentId === user.departmentId || String(r.departmentId) === String(user.departmentId));
      }
      return all;
    },
    enabled: !!user && user.role === 'HOD'
  });

  // Action Mutations
  const actionMutation = useMutation({
    mutationFn: async ({ id, action, remarks }: { id: number, action: 'approve' | 'reject', remarks?: string }) => {
      const payload = {
        approve: action === 'approve',
        reason: action === 'reject' ? remarks : undefined
      };
      
      console.log("Submitting Decision:", { id, payload, role: user?.role });
      
      if (user?.role === 'HOD') {
        return requestApi.hodDecision(id, payload);
      }
      throw new Error("Unauthorized role for this action.");
    },
    onSuccess: (_, variables) => {
      console.log("Decision Success:", variables);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: variables.action === 'approve' ? "Request Approved" : "Request Rejected",
        description: `Request ${variables.id} has been processed successfully.`,
        className: variables.action === 'approve' ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      });
      setSelectedRequest(null);
    },
    onError: (error) => {
      console.error("Decision Mutation Error:", error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const pendingRequests = requests;

  const handleAction = (id: number, action: 'approve' | 'reject', remarks: string) => {
    actionMutation.mutate({ id, action, remarks });
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold">Pending Approvals</h1>

      <div className="grid gap-4">
        {pendingRequests.map(req => (
          <Card key={req.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <h3 className="font-bold text-lg">REQ-{req.id.toString().padStart(4, '0')}</h3>
                   <StatusBadge status={req.status} />
                </div>
                <p className="text-muted-foreground text-sm mb-1">
                   {req.quantity}x {req.itemName} ({req.itemType})
                </p>
                <p className="text-xs bg-muted inline-block px-2 py-1 rounded">
                   Requester ID: {req.requestedById}
                </p>
              </div>
              <Button onClick={() => setSelectedRequest(req)}>Review</Button>
            </CardContent>
          </Card>
        ))}

        {pendingRequests.length === 0 && (
           <div className="text-center py-10 text-muted-foreground">
              No pending requests for your approval.
           </div>
        )}
      </div>

      <RequestActionDialog
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        userRole={user?.role || 'HOD'}
        onAction={handleAction}
      />
    </div>
  );
};
export default HODApprovals;
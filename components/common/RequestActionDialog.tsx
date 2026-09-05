import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { InventoryRequest } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RequestHistoryTimeline from './../requests/RequestHistoryTimeline';

interface RequestActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: InventoryRequest | null;
  userRole: string; // 'HOD' | 'LAB_IN_CHARGE' | 'MA' | 'ADMIN'
  onAction: (id: number, action: 'approve' | 'reject', remarks?: string) => void;
}

const RequestActionDialog: React.FC<RequestActionDialogProps> = ({
  isOpen, onClose, request, userRole, onAction
}) => {
  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

  if (!request) return null;

  const handleActionClick = (action: 'approve' | 'reject') => {
    if (action === 'reject' && !remarks.trim()) {
      toast({
        title: "Remarks Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }
    onAction(request.id, action, remarks.trim() || undefined);
    setRemarks('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Request: REQ-{request.id.toString().padStart(4, '0')}</DialogTitle>
          <DialogDescription>
            Requested by UID: {request.requestedById} for Dept: {request.departmentId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted p-4 rounded-lg text-sm space-y-3">
             <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="bg-white">{request.itemType}</Badge>
             </div>
             <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Item Requested:</span>
                <span className="font-semibold">{request.quantity}x {request.itemName}</span>
             </div>
             <div className="pt-1">
                <span className="text-muted-foreground block mb-1 font-medium">Purpose/Justification:</span>
                <p className="italic bg-white p-2 rounded border text-slate-700">{request.purpose || 'No purpose provided'}</p>
             </div>
             {request.specifications && (
               <div className="pt-1">
                  <span className="text-muted-foreground block mb-1 font-medium">Specifications:</span>
                  <p className="italic bg-white p-2 rounded border text-slate-700">{request.specifications}</p>
               </div>
             )}
          </div>

          <div>
             <h4 className="font-semibold text-sm mb-3">Workflow History</h4>
             <RequestHistoryTimeline history={request.history || []} currentStatus={request.status} />
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">
              Your Decision Remarks
            </Label>
            <Textarea
              placeholder="Add your comments here... (Required for rejection)"
              className="resize-none h-24"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-4">
          <Button variant="outline" className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleActionClick('reject')}>
            <XCircle className="w-4 h-4 mr-2" />
            Reject Request
          </Button>
          <Button className="w-full sm:w-auto btn-primary-gradient" onClick={() => handleActionClick('approve')}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve & Forward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestActionDialog;
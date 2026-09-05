import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'available' | 'in_use' | 'maintenance' | 'damaged' | 'disposed'
  | 'pending' | 'approved' | 'rejected' | 'completed'
  | 'approved_by_lab_incharge' | 'approved_by_hod'
  | 'scheduled' | 'in_progress' | 'cancelled'
  | 'issued' | 'returned' | 'overdue' | 'lost'
  | 'ordered' | 'shipped' | 'delivered' | 'received'
  // Backend Request/Item Statuses
  | 'SUBMITTED' | 'REVIEWED' | 'HOD_APPROVED' | 'IMO_APPROVED' | 'PURCHASED' | 'REJECTED'
  | 'ACTIVE' | 'DISUSED' | 'PENDING' | 'APPROVED' | 'IN_SERVICE' | 'COMPLETED' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Inventory status
  available: { label: 'Available', className: 'badge-success' },
  in_use: { label: 'In Use', className: 'badge-info' },
  maintenance: { label: 'Maintenance', className: 'badge-warning' },
  damaged: { label: 'Damaged', className: 'badge-destructive' },
  disposed: { label: 'Disposed', className: 'bg-muted text-muted-foreground' },
  
  // Request status
  pending: { label: 'Pending', className: 'badge-warning' },
  approved: { label: 'Approved', className: 'badge-success' },
  rejected: { label: 'Rejected', className: 'badge-destructive' },
  completed: { label: 'Completed', className: 'badge-info' },
  approved_by_lab_incharge: { label: 'Lab In-Charge Approved', className: 'bg-blue-100 text-blue-700' },
  approved_by_hod: { label: 'HOD Approved', className: 'bg-purple-100 text-purple-700' },
  
  // Maintenance status
  scheduled: { label: 'Scheduled', className: 'badge-info' },
  in_progress: { label: 'In Progress', className: 'badge-warning' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
  
  // Issue status
  issued: { label: 'Issued', className: 'badge-warning' },
  returned: { label: 'Returned', className: 'badge-success' },
  overdue: { label: 'Overdue', className: 'badge-destructive' },
  lost: { label: 'Lost', className: 'bg-red-900/10 text-red-900' },
  
  // Purchase status
  ordered: { label: 'Ordered', className: 'badge-info' },
  shipped: { label: 'Shipped', className: 'badge-warning' },
  delivered: { label: 'Delivered', className: 'badge-success' },
  received: { label: 'Received', className: 'badge-success' },

  // Backend Mapping
  SUBMITTED: { label: 'Submitted', className: 'badge-info' },
  REVIEWED: { label: 'Reviewed', className: 'badge-warning' },
  HOD_APPROVED: { label: 'HOD Approved', className: 'bg-purple-100 text-purple-700' },
  IMO_APPROVED: { label: 'IMO Approved', className: 'bg-blue-100 text-blue-700' },
  PURCHASED: { label: 'Purchased', className: 'badge-success' },
  REJECTED: { label: 'Rejected', className: 'badge-destructive' },
  ACTIVE: { label: 'Active', className: 'badge-success' },
  DISUSED: { label: 'Disused', className: 'bg-muted text-muted-foreground' },
  PENDING: { label: 'Pending', className: 'badge-warning' },
  APPROVED: { label: 'Approved', className: 'badge-success' },
  IN_SERVICE: { label: 'In Service', className: 'badge-info' },
  COMPLETED: { label: 'Completed', className: 'badge-success' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-muted' };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium capitalize",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;

import React from 'react';
import { RequestHistory, RequestStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  CheckCircle2, XCircle, Clock, PackageCheck, 
  Send, User, FileText, Check, AlertCircle 
} from 'lucide-react';

interface RequestHistoryTimelineProps {
  history: RequestHistory[];
  currentStatus: RequestStatus;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'PENDING_IN_CHARGE': { label: 'Awaiting In-Charge Approval', icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'PENDING_MA': { label: 'Awaiting MA Processing', icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'PENDING_HOD': { label: 'Awaiting HOD Approval', icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'PENDING_ADMIN': { label: 'Awaiting Admin Approval', icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'PENDING_WELFARE': { label: 'Awaiting Welfare Fulfillment', icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'COMPLETED': { label: 'Request Completed (Supplied)', icon: <PackageCheck className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'REJECTED': { label: 'Request Rejected', icon: <XCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-100 text-red-800 border-red-200' }
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'SUBMITTED': return <Send className="w-4 h-4 text-blue-500" />;
    case 'ACCEPTED': return <Check className="w-4 h-4 text-emerald-500" />;
    case 'SUPPLIED': return <PackageCheck className="w-4 h-4 text-emerald-600" />;
    case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <FileText className="w-4 h-4 text-slate-500" />;
  }
};

const RequestHistoryTimeline: React.FC<RequestHistoryTimelineProps> = ({ history, currentStatus }) => {
  const currentConfig = statusConfig[currentStatus] || statusConfig['PENDING_IN_CHARGE'];

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center">
          <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
          <p>No history available for this request.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort history newest first for display
  const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* Current Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${currentConfig.color}`}>
        {currentConfig.icon}
        <div>
          <div className="font-semibold">{currentConfig.label}</div>
          <div className="text-sm opacity-80">Current workflow stage</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {sortedHistory.map((item, index) => (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Center Timeline Node */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {getActionIcon(item.action)}
            </div>
            
            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <span className="font-semibold text-slate-900 capitalize">
                  {item.action.toLowerCase()} by {item.role.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                </span>
              </div>
              
              {/* Optional Actor Name if available */}
              {item.actedByName && (
                <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5" />
                  {item.actedByName}
                </div>
              )}

              {/* Reject Reason Block */}
              {item.reason && (
                <div className="mt-2 p-3 bg-slate-50 border rounded text-sm text-slate-700 italic">
                  "{item.reason}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestHistoryTimeline;

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, FileText, CheckCircle2, AlertTriangle, TrendingUp, Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/common/StatsCard';
import ActivityFeed from '@/components/common/ActivityFeed';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/services/inventory.service';
import { requestApi } from '@/lib/services/request.service';

const HODDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: inventoryItems = [] } = useQuery({ 
    queryKey: ['inventory', 'my-department'], 
    queryFn: () => inventoryApi.getMyDepartment(),
    enabled: !!user
  });
  const { data: pendingRequests = [] } = useQuery({ 
    queryKey: ['requests', 'PENDING_HOD'], 
    queryFn: () => requestApi.getPendingHOD() 
  });

  // Currently we just match on user's department ID if available
  const deptItems = inventoryItems.filter(i => i.departmentId === user?.departmentId);
  
  // Total value logic (mock calculation for now since price isn't attached to standard item dto)
  const totalValue = deptItems.reduce((sum, i) => sum + (i.quantity * 1000), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Welcome, {user?.f_Name}</h1>
        <p className="text-muted-foreground">{user?.department || 'Department Overview'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Department Items" value={deptItems.length} icon={Package} variant="primary" delay={0} />
        <StatsCard title="Pending Approvals" value={pendingRequests.length} icon={Clock} variant="warning" delay={0.1} />
        <StatsCard title="Approved This Month" value={12} icon={CheckCircle2} variant="success" delay={0.2} />
        <StatsCard title="Total Value" value={`Rs. ${(totalValue / 100000).toFixed(1)}M`} icon={TrendingUp} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Pending Approvals</CardTitle>
            <CardDescription>Requests awaiting your action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No pending requests</div>
              ) : (
                pendingRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">REQ-{req.id.toString().padStart(4, '0')}</p>
                      <p className="text-sm text-muted-foreground">{req.quantity} units of {req.itemName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      <Button size="sm" variant="outline" onClick={() => navigate('/hod/approvals')}>Review</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">No recent activity</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default HODDashboard;

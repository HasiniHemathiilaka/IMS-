import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Check, X, ArrowRightLeft, RotateCcw
} from 'lucide-react';
import { Activity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const activityIcons: Record<Activity['type'], React.ElementType> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  approve: Check,
  reject: X,
  issue: ArrowRightLeft,
  return: RotateCcw,
};

const activityColors: Record<Activity['type'], string> = {
  create: 'bg-success/10 text-success',
  update: 'bg-info/10 text-info',
  delete: 'bg-destructive/10 text-destructive',
  approve: 'bg-success/10 text-success',
  reject: 'bg-destructive/10 text-destructive',
  issue: 'bg-warning/10 text-warning',
  return: 'bg-info/10 text-info',
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  maxItems = 10 
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {displayedActivities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex gap-4"
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              activityColors[activity.type]
            )}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activity.action}</p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {activity.user}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
      
      {activities.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No recent activity
        </p>
      )}
    </div>
  );
};

export default ActivityFeed;

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Armchair, ArrowRight } from 'lucide-react';
import { Department } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DepartmentCardProps {
  department: Department;
  onClick?: () => void;
  delay?: number;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onClick,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="bg-card rounded-xl border shadow-sm overflow-hidden group cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      {/* Image Area */}
      <div className="relative h-40 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img
          src={department.image}
          alt={department.fullName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-3 left-4 z-20">
          <Badge className="bg-white/90 text-black hover:bg-white mb-1 shadow-sm border-0">
            {department.code}
          </Badge>
          <h3 className="font-serif font-semibold text-lg leading-tight text-white shadow-sm">
            {department.name}
          </h3>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1">
          {department.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{department.totalEquipment}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Equipment</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <Armchair className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{department.totalFurniture}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Furniture</p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
        >
          View Inventory
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};

export default DepartmentCard;
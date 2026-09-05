import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Plus, Edit, Eye, AlertTriangle, Loader2,
  ChevronDown, Search, ArchiveX, PackagePlus, RefreshCw,
  Tags, Trash2, FolderPlus,
} from 'lucide-react';
import { InventoryItem, InventoryCategory, ItemType } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { inventoryApi } from '@/lib/services/inventory.service';
import { departmentApi } from '@/lib/services/department.service';
import { categoryApi } from '@/lib/services/category.service';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatsCard from '@/components/common/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* ─── Form type (matches InventoryItemRequestDTO) ─────────────────────────── */
interface ItemForm {
  name: string;
  type: ItemType | '';
  categoryId: string;
  departmentId: string;
  specifications: string;
  quantity: string;
  threshold: string;
  location: string;
}

const EMPTY_FORM: ItemForm = {
  name: '', type: '', categoryId: '', departmentId: '',
  specifications: '', quantity: '0', threshold: '0', location: '',
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const AdminInventory: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | ItemType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [viewTarget, setViewTarget] = useState<InventoryItem | null>(null);
  const [disuseTarget, setDisuseTarget] = useState<InventoryItem | null>(null);
  const [stockInTarget, setStockInTarget] = useState<InventoryItem | null>(null);
  const [stockQty, setStockQty] = useState('1');
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);

  /* ── Data Queries ── */
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory', user?.role === 'ADMIN' || user?.role === 'IMO' ? 'all' : 'my-department'],
    queryFn: () => {
      if (user?.role === 'ADMIN' || user?.role === 'IMO') {
        return inventoryApi.getAll();
      } else {
        // HOD, LAB_IN_CHARGE, LAB_TO, MA — only their own department
        return inventoryApi.getMyDepartment();
      }
    },
    enabled: !!user,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });

  /* ── Mutations ── */
  const addMutation = useMutation({
    mutationFn: (payload: object) => inventoryApi.add(payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Item added', description: `"${form.name}" has been added to inventory.` });
      closeDialog();
    },
    onError: () => toast({ title: 'Error', description: 'Failed to add item.', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: object }) =>
      inventoryApi.update(id, payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Item updated', description: `"${form.name}" has been updated.` });
      closeDialog();
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update item.', variant: 'destructive' }),
  });

  const disuseMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.markDisused(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Marked as Disused', description: 'Item has been marked as disused.' });
      setDisuseTarget(null);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to mark as disused.', variant: 'destructive' }),
  });

  const stockInMutation = useMutation({
    mutationFn: ({ id, qty }: { id: number; qty: number }) => inventoryApi.stockIn(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: 'Stock updated', description: `${stockQty} units added to stock.` });
      setStockInTarget(null);
      setStockQty('1');
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update stock.', variant: 'destructive' }),
  });

  /* ── Category dialog state ── */
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catEditTarget, setCatEditTarget] = useState<InventoryCategory | null>(null);
  const [catDeleteTarget, setCatDeleteTarget] = useState<InventoryCategory | null>(null);
  const [catForm, setCatForm] = useState({ categoryName: '', categoryDesc: '' });

  const openCatAdd = () => { setCatEditTarget(null); setCatForm({ categoryName: '', categoryDesc: '' }); setCatDialogOpen(true); };
  const openCatEdit = (c: InventoryCategory) => { setCatEditTarget(c); setCatForm({ categoryName: c.categoryName, categoryDesc: c.categoryDesc ?? '' }); setCatDialogOpen(true); };
  const closeCatDialog = () => { setCatDialogOpen(false); setCatEditTarget(null); setCatForm({ categoryName: '', categoryDesc: '' }); };

  const openAdd = () => {
    setEditTarget(null);
    // Non-privileged roles can only add SIMPLE items, so pre-select it
    const defaultType = (user?.role === 'ADMIN' || user?.role === 'IMO') ? '' : 'SIMPLE';
    setForm({ ...EMPTY_FORM, type: defaultType as ItemType | '' });
    setDialogOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      type: item.type,
      categoryId: item.categoryId?.toString() ?? '',
      departmentId: item.departmentId?.toString() ?? '',
      specifications: item.specifications ?? '',
      quantity: item.quantity?.toString() ?? '0',
      threshold: item.threshold?.toString() ?? '0',
      location: item.location ?? '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const buildPayload = () => ({
    name: form.name,
    type: form.type,
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    departmentId: form.departmentId ? Number(form.departmentId) : null,
    specifications: form.specifications,
    quantity: Number(form.quantity),
    threshold: Number(form.threshold),
    location: form.location,
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.type) {
      toast({ title: 'Validation', description: 'Name and Type are required.', variant: 'destructive' });
      return;
    }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, payload: buildPayload() });
    } else {
      addMutation.mutate(buildPayload());
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  /* ── Category mutations ── */
  const addCatMutation = useMutation({
    mutationFn: () => categoryApi.save({ categoryName: catForm.categoryName, categoryDesc: catForm.categoryDesc }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast({ title: 'Category created', description: `"${catForm.categoryName}" added.` }); closeCatDialog(); },
    onError: () => toast({ title: 'Error', description: 'Failed to create category.', variant: 'destructive' }),
  });

  const updateCatMutation = useMutation({
    mutationFn: () => categoryApi.update(catEditTarget!.id, { categoryName: catForm.categoryName, categoryDesc: catForm.categoryDesc }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast({ title: 'Category updated', description: `"${catForm.categoryName}" updated.` }); closeCatDialog(); },
    onError: () => toast({ title: 'Error', description: 'Failed to update category.', variant: 'destructive' }),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast({ title: 'Category deleted' }); setCatDeleteTarget(null); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete category.', variant: 'destructive' }),
  });

  const handleCatSave = () => {
    if (!catForm.categoryName.trim()) {
      toast({ title: 'Validation', description: 'Category name is required.', variant: 'destructive' }); return;
    }
    catEditTarget ? updateCatMutation.mutate() : addCatMutation.mutate();
  };
  const isCatSaving = addCatMutation.isPending || updateCatMutation.isPending;

  const deptName = (id: number) =>
    departments.find(d => d.id === id)?.name ?? `Dept ${id}`;
  const catName = (id: number) =>
    categories.find(c => c.id === id)?.categoryName ?? `Cat ${id}`;

  /* ── Filtered data ── */
  const filtered = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesDept = selectedDeptFilter === 'all' || item.departmentId?.toString() === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'all' || item.status === selectedStatusFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specifications ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesDept && matchesStatus && matchesSearch;
  });

  const capitalCount = items.filter(i => i.type === 'CAPITAL').length;
  const simpleCount = items.filter(i => i.type === 'SIMPLE').length;
  const lowStockCount = items.filter(i => i.threshold != null && i.quantity <= i.threshold).length;
  const disusedCount = items.filter(i => i.status === 'DISUSED').length;

  /* ── Columns ── */
  const columns = [
    {
      key: 'name',
      header: 'Item',
      sortable: true,
      cell: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            item.type === 'CAPITAL' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700',
          )}>
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
              {item.specifications || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      cell: (item: InventoryItem) => (
        <Badge variant="outline" className={item.type === 'CAPITAL'
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'}>
          {item.type}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      cell: (item: InventoryItem) => (
        <span className="text-sm">{item.departmentId ? deptName(item.departmentId) : 'N/A'}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (item: InventoryItem) => (
        <span className="text-sm text-muted-foreground">{item.categoryId ? catName(item.categoryId) : '—'}</span>
      ),
    },
    {
      key: 'quantity',
      header: 'Stock',
      sortable: true,
      cell: (item: InventoryItem) => (
        <div className="flex items-center gap-1.5">
          <span className={cn('font-semibold tabular-nums',
            item.threshold != null && item.quantity <= item.threshold
              ? 'text-destructive' : 'text-foreground',
          )}>
            {item.quantity}
          </span>
          {item.threshold != null && item.quantity <= item.threshold && (
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          )}
          {item.threshold != null && (
            <span className="text-xs text-muted-foreground">/ {item.threshold} min</span>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (item: InventoryItem) => (
        <span className="text-sm text-muted-foreground">{item.location || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: InventoryItem) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (item: InventoryItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              Actions <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewTarget(item)}>
              <Eye className="w-4 h-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(item)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setStockInTarget(item); setStockQty('1'); }}>
              <PackagePlus className="w-4 h-4 mr-2" /> Stock In
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {item.status === 'ACTIVE' && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDisuseTarget(item)}
              >
                <ArchiveX className="w-4 h-4 mr-2" /> Mark as Disused
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">View and manage all laboratory equipment and supplies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { closeCatDialog(); setCatDialogOpen(true); }} className="gap-2">
            <Tags className="w-4 h-4" /> Manage Categories
          </Button>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add New Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Items" value={items.length} icon={Package} variant="primary" delay={0} />
        <StatsCard title="Capital Items" value={capitalCount} icon={Package} variant="success" delay={0.1} />
        <StatsCard title="Simple Items" value={simpleCount} icon={Package} delay={0.2} />
        <StatsCard title="Low Stock" value={lowStockCount} icon={AlertTriangle} variant="warning" delay={0.3} />
      </div>

      {/* Table with tabs + filters */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList>
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="CAPITAL">Capital ({capitalCount})</TabsTrigger>
            <TabsTrigger value="SIMPLE">Simple ({simpleCount})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedDeptFilter} onValueChange={setSelectedDeptFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DISUSED">Disused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                data={filtered}
                columns={columns}
                searchPlaceholder="Search by name, specifications, location…"
                onSearch={setSearchQuery}
                emptyMessage="No inventory items found"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={open => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
            <DialogDescription>
              {editTarget ? 'Update the item details below.' : 'Fill in the details to add a new item.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Item Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Digital Multimeter"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={!!editTarget && !(user?.role === 'ADMIN' || user?.role === 'IMO')}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label>Type <span className="text-destructive">*</span></Label>
              {(user?.role === 'ADMIN' || user?.role === 'IMO') ? (
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as ItemType })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAPITAL">CAPITAL (Long-term asset)</SelectItem>
                    <SelectItem value="SIMPLE">SIMPLE (Consumable)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground italic">
                  {form.type || 'SIMPLE'} — {editTarget ? 'locked for non-Admin' : 'only Admin can add Capital items'}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select 
                value={form.categoryId} 
                onValueChange={v => setForm({ ...form, categoryId: v })}
                disabled={!!editTarget && !(user?.role === 'ADMIN' || user?.role === 'IMO')}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.categoryName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select 
                value={form.departmentId} 
                onValueChange={v => setForm({ ...form, departmentId: v })}
                disabled={!!editTarget && !(user?.role === 'ADMIN' || user?.role === 'IMO')}
              >
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                placeholder="e.g. Block A, Room 101"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                disabled={!!editTarget && !(user?.role === 'ADMIN' || user?.role === 'IMO')}
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label>Initial Quantity</Label>
              <Input
                type="number" min="0"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
              />
            </div>

            {/* Threshold */}
            <div className="space-y-1.5">
              <Label>Low-Stock Threshold</Label>
              <Input
                type="number" min="0"
                placeholder="0"
                value={form.threshold}
                onChange={e => setForm({ ...form, threshold: e.target.value })}
              />
            </div>

            {/* Specifications */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Specifications / Description</Label>
              <Textarea
                placeholder="Technical specifications or description…"
                rows={3}
                value={form.specifications}
                onChange={e => setForm({ ...form, specifications: e.target.value })}
                disabled={!!editTarget && !(user?.role === 'ADMIN' || user?.role === 'IMO')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editTarget ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Details Dialog ── */}
      <Dialog open={!!viewTarget} onOpenChange={open => !open && setViewTarget(null)}>
        <DialogContent className="max-w-lg">
          {viewTarget && (
            <>
              <DialogHeader>
                <DialogTitle>{viewTarget.name}</DialogTitle>
                <DialogDescription>{viewTarget.specifications || 'No description'}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2 text-sm">
                {[
                  ['Type', <Badge variant="outline">{viewTarget.type}</Badge>],
                  ['Status', <StatusBadge status={viewTarget.status} />],
                  ['Department', deptName(viewTarget.departmentId)],
                  ['Category', catName(viewTarget.categoryId)],
                  ['Quantity', viewTarget.quantity],
                  ['Threshold', viewTarget.threshold ?? '—'],
                  ['Location', viewTarget.location || '—'],
                  ['Created', viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleDateString() : '—'],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
                    <p className="font-medium">{val as React.ReactNode}</p>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewTarget(null)}>Close</Button>
                <Button onClick={() => { openEdit(viewTarget); setViewTarget(null); }} className="gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Stock In Dialog ── */}
      <Dialog open={!!stockInTarget} onOpenChange={open => !open && setStockInTarget(null)}>
        <DialogContent className="max-w-sm">
          {stockInTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Stock In
                </DialogTitle>
                <DialogDescription>
                  Add received quantity for <strong>{stockInTarget.name}</strong>.
                  Current stock: <strong>{stockInTarget.quantity}</strong>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label>Quantity to Add</Label>
                <Input
                  type="number" min="1"
                  value={stockQty}
                  onChange={e => setStockQty(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStockInTarget(null)}>Cancel</Button>
                <Button
                  disabled={stockInMutation.isPending || !Number(stockQty)}
                  onClick={() => stockInMutation.mutate({ id: stockInTarget.id, qty: Number(stockQty) })}
                  className="gap-2"
                >
                  {stockInMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Stock In
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Mark Disused Confirm ── */}
      <AlertDialog open={!!disuseTarget} onOpenChange={open => !open && setDisuseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Disused?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{disuseTarget?.name}</strong> will be marked as <strong>DISUSED</strong> and
              removed from active inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => disuseTarget && disuseMutation.mutate(disuseTarget.id)}
              disabled={disuseMutation.isPending}
            >
              {disuseMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Yes, Mark as Disused
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Manage Categories Dialog ── */}
      <Dialog open={catDialogOpen} onOpenChange={open => !open && closeCatDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5" />
              {catEditTarget ? 'Edit Category' : 'Manage Categories'}
            </DialogTitle>
            <DialogDescription>
              {catEditTarget ? 'Update the category details.' : 'Create, edit or delete inventory categories.'}
            </DialogDescription>
          </DialogHeader>

          {/* Add / Edit form */}
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Category Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Electronic Equipment"
                value={catForm.categoryName}
                onChange={e => setCatForm({ ...catForm, categoryName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Short description (optional)"
                value={catForm.categoryDesc}
                onChange={e => setCatForm({ ...catForm, categoryDesc: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              {catEditTarget && (
                <Button variant="outline" size="sm" onClick={closeCatDialog} disabled={isCatSaving}>Cancel Edit</Button>
              )}
              <Button size="sm" onClick={handleCatSave} disabled={isCatSaving} className="gap-2">
                {isCatSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <FolderPlus className="w-4 h-4" />
                {catEditTarget ? 'Save Changes' : 'Add Category'}
              </Button>
            </div>
          </div>

          {/* Existing categories list */}
          <div className="border-t pt-3 space-y-1 max-h-60 overflow-y-auto">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No categories yet.</p>
            )}
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{c.categoryName}</p>
                  {c.categoryDesc && <p className="text-xs text-muted-foreground">{c.categoryDesc}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCatEdit(c)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setCatDeleteTarget(c)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCatDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Category Confirm ── */}
      <AlertDialog open={!!catDeleteTarget} onOpenChange={open => !open && setCatDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{catDeleteTarget?.categoryName}</strong> will be permanently deleted.
              Items using this category will lose their category reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => catDeleteTarget && deleteCatMutation.mutate(catDeleteTarget.id)}
              disabled={deleteCatMutation.isPending}
            >
              {deleteCatMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
};

export default AdminInventory;

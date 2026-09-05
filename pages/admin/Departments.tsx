import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/lib/services/department.service';
import { Department } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Building2, Plus, Pencil, Trash2, Loader2,
  Search, CheckCircle, XCircle, LayoutGrid,
} from 'lucide-react';
import StatsCard from '@/components/common/StatsCard';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface DeptForm {
  name: string;
  code: string;
  status: boolean;
}

const EMPTY_FORM: DeptForm = { name: '', code: '', status: true };

/* ─── Component ──────────────────────────────────────────────────────────── */

const AdminDepartments: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ── State ── */
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [form, setForm] = useState<DeptForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  /* ── Query ── */
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.getAll,
  });

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (dept: Partial<Department>) => departmentApi.create(dept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department created', description: `"${form.name}" has been added.` });
      closeDialog();
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create department.', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dept }: { id: number; dept: Partial<Department> }) =>
      departmentApi.update(id, dept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department updated', description: `"${form.name}" has been updated.` });
      closeDialog();
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update department.', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Deleted', description: 'Department removed successfully.' });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete department.', variant: 'destructive' }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (dept: Department) =>
      departmentApi.update(dept.id, { ...dept, status: !dept.status }),
    onSuccess: (_, dept) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Status updated', description: `Department is now ${!dept.status ? 'active' : 'inactive'}.` });
    },
  });

  /* ── Helpers ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditTarget(dept);
    setForm({ name: dept.name, code: dept.code, status: dept.status });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast({ title: 'Validation', description: 'Name and Code are required.', variant: 'destructive' });
      return;
    }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, dept: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── Derived ── */
  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = departments.filter((d) => d.status).length;
  const inactiveCount = departments.length - activeCount;

  /* ── Render ── */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold">Departments</h1>
          <p className="text-muted-foreground">Manage all faculty departments</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Departments" value={departments.length} icon={Building2} variant="primary" delay={0} />
        <StatsCard title="Active" value={activeCount} icon={CheckCircle} variant="success" delay={0.1} />
        <StatsCard title="Inactive" value={inactiveCount} icon={XCircle} variant="warning" delay={0.2} />
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" /> All Departments
              </CardTitle>
              <CardDescription>{filtered.length} department{filtered.length !== 1 ? 's' : ''} found</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Building2 className="w-10 h-10 opacity-30" />
              <p>{search ? 'No departments match your search.' : 'No departments yet. Click "Add Department" to create one.'}</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((dept, idx) => (
                    <TableRow key={dept.id} className="group">
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>

                      <TableCell>
                        <span className="font-mono text-sm font-semibold bg-muted px-2 py-0.5 rounded">
                          {dept.code}
                        </span>
                      </TableCell>

                      <TableCell className="font-medium">{dept.name}</TableCell>

                      <TableCell>
                        <button
                          onClick={() => toggleStatusMutation.mutate(dept)}
                          title="Click to toggle status"
                          className="focus:outline-none"
                        >
                          {dept.status ? (
                            <Badge variant="default" className="gap-1 cursor-pointer bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-3 h-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 cursor-pointer">
                              <XCircle className="w-3 h-3" /> Inactive
                            </Badge>
                          )}
                        </button>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(dept)}
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(dept)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Department' : 'Add New Department'}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Update the department details below.'
                : 'Fill in the details to create a new department.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name <span className="text-destructive">*</span></Label>
              <Input
                id="dept-name"
                placeholder="e.g. Electrical & Electronics Engineering"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dept-code">Department Code <span className="text-destructive">*</span></Label>
              <Input
                id="dept-code"
                placeholder="e.g. EEE"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                maxLength={10}
              />
            </div>

            <div className="flex items-center gap-3">
              <Label>Status</Label>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: !form.status })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.status ? 'bg-green-500' : 'bg-muted'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.status ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className="text-sm text-muted-foreground">{form.status ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editTarget ? 'Save Changes' : 'Create Department'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong> ({deleteTarget?.code}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
};

export default AdminDepartments;

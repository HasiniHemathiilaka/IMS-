import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users as UsersIcon, Plus, Edit, Trash2, Shield, Mail, Phone,
  MoreVertical, UserCheck, UserX, Search, Filter, Loader2
} from 'lucide-react';
import { DEPARTMENTS, ROLE_LABELS } from '@/lib/constants';
import { User, UserRole } from '@/lib/types';
import { userApi } from '@/lib/services/user.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '@/components/common/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New User Form State
  const [newUser, setNewUser] = useState({
    f_Name: '',
    l_Name: '',
    email: '',
    contactNo: '',
    role: '',
    departmentId: '',
    state: true,
    password: 'password123' // Default password for newly created users
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll
  });

  const addUserMutation = useMutation({
    mutationFn: (userData: any) => userApi.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddDialogOpen(false);
      setNewUser({ f_Name: '', l_Name: '', email: '', contactNo: '', role: '', departmentId: '', state: true, password: 'password123' });
      toast({ title: 'User created successfully' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.data || error?.response?.data?.message || '';
      const isDuplicate = typeof msg === 'string' && msg.toLowerCase().includes('already');
      toast({
        title: isDuplicate ? 'Email already registered' : 'Failed to create user',
        description: isDuplicate
          ? 'A user with this email address already exists.'
          : 'Please check the details and try again.',
        variant: 'destructive'
      });
    }
  });

  const editUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<User> }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(null);
      toast({ title: 'User updated successfully' });
    },
    onError: () => toast({ title: 'Failed to update user', variant: 'destructive' })
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => userApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => userApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const userDeptId = user.departmentId ? user.departmentId.toString() : '';
    const matchesDepartment = selectedDepartment === 'all' || userDeptId === selectedDepartment;
    const matchesSearch =
      user.f_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.l_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesDepartment && matchesSearch;
  });

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    HOD: 'bg-blue-100 text-blue-700 border-blue-200',
    LAB_IN_CHARGE: 'bg-teal-100 text-teal-700 border-teal-200',
    MA: 'bg-orange-100 text-orange-700 border-orange-200',
    LAB_TO: 'bg-green-100 text-green-700 border-green-200',
    IMO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      cell: (user: User) => {
        const fullName = `${user.f_Name || ''} ${user.l_Name || ''}`.trim();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {fullName ? fullName[0].toUpperCase() : user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{fullName || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      cell: (user: User) => (
        <Badge variant="outline" className={cn("font-medium", roleColors[user.role])}>
          {ROLE_LABELS[user.role]}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      cell: (user: User) => {
        const deptName = user.departmentId 
          ? DEPARTMENTS.find(d => d.id === String(user.departmentId))?.name || `Dept ${user.departmentId}`
          : 'N/A';
        return <Badge variant="outline">{deptName}</Badge>;
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      cell: (user: User) => (
        <Badge
          variant="outline"
          className={user.state ? 'badge-success' : 'badge-destructive'}
        >
          {user.state ? 'Active' : 'Pending/Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              if (user.state) deactivateMutation.mutate(user.id);
              else activateMutation.mutate(user.id);
            }}>
              {user.state ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            // Reset form whenever dialog closes (cancel, backdrop click, X button)
            setNewUser({ f_Name: '', l_Name: '', email: '', contactNo: '', role: '', departmentId: '', state: true, password: 'password123' });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-primary-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role and department assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    placeholder="John" 
                    value={newUser.f_Name}
                    onChange={(e) => setNewUser({...newUser, f_Name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    placeholder="Doe" 
                    value={newUser.l_Name}
                    onChange={(e) => setNewUser({...newUser, l_Name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="email@eng.jfn.ac.lk" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password" 
                  placeholder="Enter password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  type="tel" 
                  placeholder="+94 21 222 XXXX" 
                  value={newUser.contactNo}
                  onChange={(e) => setNewUser({...newUser, contactNo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(val) => setNewUser({...newUser, role: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newUser.role !== 'ADMIN' && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={newUser.departmentId} onValueChange={(val) => setNewUser({...newUser, departmentId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="btn-primary-gradient"
                onClick={() => {
                  const payload = {
                    ...newUser,
                    departmentId: newUser.role === 'ADMIN' ? null : (newUser.departmentId ? parseInt(newUser.departmentId) : null)
                  };
                  addUserMutation.mutate(payload);
                }}
                disabled={addUserMutation.isPending || !newUser.email || !newUser.password || !newUser.role || (newUser.role !== 'ADMIN' && !newUser.departmentId)}
              >
                {addUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(ROLE_LABELS).map(([role, label], index) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-4 border shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  roleColors[role]
                )}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="font-serif">All Users</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredUsers}
            columns={columns}
            searchPlaceholder="Search users..."
            onSearch={setSearchQuery}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">Edit User</DialogTitle>
                <DialogDescription>
                  Update user information and permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {`${selectedUser.f_Name?.[0] ?? ''}${selectedUser.l_Name?.[0] ?? ''}`}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{`${selectedUser.f_Name ?? ''} ${selectedUser.l_Name ?? ''}`.trim() || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={selectedUser.f_Name || ''} 
                    onChange={(e) => setSelectedUser({...selectedUser, f_Name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={selectedUser.l_Name || ''} 
                    onChange={(e) => setSelectedUser({...selectedUser, l_Name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" value={selectedUser.email} disabled className="bg-muted opacity-50" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={selectedUser.role} onValueChange={(val) => setSelectedUser({...selectedUser, role: val as UserRole})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([role, label]) => (
                        <SelectItem key={role} value={role}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUser.role !== 'ADMIN' && (
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select 
                      value={selectedUser.departmentId ? selectedUser.departmentId.toString() : ''}
                      onValueChange={(val) => setSelectedUser({...selectedUser, departmentId: parseInt(val)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button 
                  className="btn-primary-gradient"
                  onClick={() => {
                    editUserMutation.mutate({
                      id: selectedUser.id,
                      data: {
                        f_Name: selectedUser.f_Name,
                        l_Name: selectedUser.l_Name,
                        role: selectedUser.role,
                        departmentId: selectedUser.role === 'ADMIN' ? undefined : selectedUser.departmentId
                      }
                    });
                  }}
                  disabled={editUserMutation.isPending}
                >
                  {editUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUsers;

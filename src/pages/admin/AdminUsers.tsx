import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Search, Download, ShieldCheck, Truck, User as UserIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('jwt_token');

const authHeaders = () => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
});

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'driver';
  is_admin: boolean;
  is_driver: boolean;
  created_at?: string;
}

// ── Inline UserModal ─────────────────────────────────────────────────────────
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'driver'>('user');
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'user');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setRole('user');
      setPassword('');
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Validation error', description: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    if (!isEdit && password.length < 8) {
      toast({ title: 'Validation error', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const body: Record<string, string> = { name, email, role };
      if (!isEdit || password) body.password = password;

      const res = await fetch(
        isEdit ? `${API_URL}/api/users/${user!.id}` : `${API_URL}/api/users`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: authHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save user');
      }

      toast({ title: isEdit ? 'User updated' : 'User created', description: `${name} has been ${isEdit ? 'updated' : 'added'} successfully.` });
      onSave();
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create New User'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="u-name" className="text-right">Name</Label>
            <Input id="u-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="Full name" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="u-email" className="text-right">Email</Label>
            <Input id="u-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" placeholder="user@example.com" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="u-pass" className="text-right">{isEdit ? 'New Password' : 'Password'}</Label>
            <Input
              id="u-pass"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="col-span-3"
              placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Role</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  if (role === 'admin') return (
    <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1">
      <ShieldCheck size={12} /> Admin
    </Badge>
  );
  if (role === 'driver') return (
    <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
      <Truck size={12} /> Driver
    </Badge>
  );
  return (
    <Badge variant="secondary" className="gap-1">
      <UserIcon size={12} /> Customer
    </Badge>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'driver'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast({ title: 'User deleted', description: `${user.name} was removed.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    if (!users.length) return;
    const headers = ['ID', 'Name', 'Email', 'Role', 'Created At'];
    const rows = users.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const filtered = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Summary counts
  const counts = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    driver: users.filter(u => u.role === 'driver').length,
    customer: users.filter(u => u.role === 'user').length,
  };

  return (
    <AdminLayout title="User Management">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: counts.total, color: 'bg-gray-50 border-gray-200' },
          { label: 'Admins', value: counts.admin, color: 'bg-purple-50 border-purple-200' },
          { label: 'Drivers', value: counts.driver, color: 'bg-blue-50 border-blue-200' },
          { label: 'Customers', value: counts.customer, color: 'bg-green-50 border-green-200' },
        ].map(card => (
          <div key={card.label} className={`border rounded-lg p-4 ${card.color}`}>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No users found{searchTerm ? ` matching "${searchTerm}"` : ''}.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(user => (
                  <TableRow key={user.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell><RoleBadge role={user.role} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingUser(user); setIsModalOpen(true); }}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchUsers}
        user={editingUser}
      />
    </AdminLayout>
  );
};

export default AdminUsers;

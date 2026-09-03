import React, { useState } from 'react';
import { usersApi } from '../../api/users.api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Users, Search, ShieldCheck, Store, Sprout } from 'lucide-react';
import { UserRole } from '../../types/auth.types';

export const AdminUsersPage: React.FC = () => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsersList'],
    queryFn: () => usersApi.getUsers(),
  });

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.kisanId && u.kisanId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const roleBadges = {
    farmer: 'green',
    vendor: 'blue',
    admin: 'purple',
    guest: 'gray',
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            User Accounts & Role Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage authenticated farmers, authorized regional suppliers, and administrative staff.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, phone, Kisan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="farmer">Farmers Only</option>
            <option value="vendor">Vendors Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">User & Identity</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Assigned Role</th>
                <th className="py-4 px-4">Registration ID / GSTIN</th>
                <th className="py-4 px-6 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={u.fullName}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-purple-500/20"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.fullName}</span>
                        {u.vendorBusinessName && (
                          <span className="text-[11px] text-blue-700 font-semibold">{u.vendorBusinessName}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-slate-900 block">{u.email}</span>
                    <span className="text-[11px] text-slate-400">{u.phone}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={roleBadges[u.role]} size="sm" dot>
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-600">
                    {u.kisanId || u.vendorGstin || 'System Verified'}
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

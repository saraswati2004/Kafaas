import React from 'react';
import { usersApi } from '../../api/users.api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../../components/common/Badge';
import { ScrollText, ShieldCheck, UserCheck, Terminal } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => usersApi.getAuditLogs(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Administrative Audit & Security Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable chronological record of administrative actions, catalog modifications, and matrix updates.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-4">Action Type</th>
                <th className="py-4 px-4">Target Entity</th>
                <th className="py-4 px-6">Details</th>
                <th className="py-4 px-4">Actor</th>
                <th className="py-4 px-6 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-sans">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="py-4 px-4 font-bold text-purple-700">
                    {log.action}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700 uppercase text-[11px]">
                    {log.targetEntity} (#{log.targetId})
                  </td>
                  <td className="py-4 px-6 font-sans text-xs text-slate-700">
                    {log.details}
                  </td>
                  <td className="py-4 px-4 font-sans text-xs font-bold text-slate-900">
                    {log.actorName} ({log.actorRole})
                  </td>
                  <td className="py-4 px-6 text-right text-slate-400">
                    {log.ipAddress}
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

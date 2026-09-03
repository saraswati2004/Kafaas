import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users.api';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Award, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const VendorSalesPage: React.FC = () => {
  const { user } = useAuth();
  const { data: metrics } = useQuery({
    queryKey: ['vendorSalesMetrics', user?.id],
    queryFn: () => usersApi.getVendorMetrics(user?.id),
  });

  const months = metrics?.monthlyRevenue || [
    { month: 'Apr', amount: 52000 },
    { month: 'May', amount: 68000 },
    { month: 'Jun', amount: 94000 },
    { month: 'Jul', amount: 112000 },
    { month: 'Aug', amount: 159000 },
  ];

  const maxAmount = Math.max(...months.map((m) => m.amount));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track gross merchandise value, top-selling agrochemicals, and monthly payouts.
          </p>
        </div>

        <Button
          onClick={() => window.print()}
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Statement
        </Button>
      </div>

      {/* Monthly Bar Visualizer */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
        <h3 className="text-base font-bold text-slate-900">
          Monthly Dispatched Revenue (FY 2026-27)
        </h3>

        <div className="h-64 flex items-end justify-between gap-4 sm:gap-8 pt-6 border-b border-slate-200">
          {months.map((m) => {
            const heightPercent = Math.round((m.amount / maxAmount) * 100);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-700">
                  ₹{(m.amount / 1000).toFixed(0)}k
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-xl transition-all duration-500 shadow-sm"
                />
                <span className="text-xs font-bold text-slate-500 mt-2">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { OrderTrackingEvent, OrderStatus } from '../../types/order.types';
import { CheckCircle2, Clock, Truck, Package, Home, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface OrderStatusTimelineProps {
  timeline: OrderTrackingEvent[];
  currentStatus: OrderStatus;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  timeline,
  currentStatus,
}) => {
  const getStatusIcon = (status: OrderStatus, completed: boolean) => {
    if (status === 'cancelled') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    if (completed) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-slate-400" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-slate-400" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-slate-400" />;
      case 'delivered':
        return <Home className="w-5 h-5 text-slate-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="py-4">
      {/* Desktop Horizontal Step Bar */}
      <div className="hidden sm:grid grid-cols-6 gap-2 relative">
        {/* Continuous track line */}
        <div className="absolute top-4 left-[8%] right-[8%] h-1 bg-slate-200 -z-0" />

        {timeline.map((event, idx) => {
          const isCompleted = event.completed;
          const isCurrent = event.status === currentStatus;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-600 shadow-sm'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-500 text-amber-600 animate-pulse ring-4 ring-amber-100'
                    : 'bg-white border-slate-300 text-slate-400'
                )}
              >
                {getStatusIcon(event.status, isCompleted)}
              </div>
              <span
                className={clsx(
                  'text-xs font-bold mt-2.5 max-w-[100px] leading-tight',
                  isCompleted
                    ? 'text-emerald-900'
                    : isCurrent
                    ? 'text-amber-900 font-extrabold'
                    : 'text-slate-400'
                )}
              >
                {event.title}
              </span>
              {event.timestamp && (
                <span className="text-[10px] text-slate-400 mt-1">
                  {new Date(event.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="sm:hidden space-y-6 relative pl-6 border-l-2 border-slate-200 ml-3">
        {timeline.map((event, idx) => {
          const isCompleted = event.completed;

          return (
            <div key={idx} className="relative">
              {/* Node dot */}
              <div
                className={clsx(
                  'absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white',
                  isCompleted ? 'border-emerald-600 text-emerald-600' : 'border-slate-300 text-slate-300'
                )}
              >
                {getStatusIcon(event.status, isCompleted)}
              </div>

              <div>
                <h4
                  className={clsx(
                    'text-sm font-bold',
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  )}
                >
                  {event.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                {event.timestamp && (
                  <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

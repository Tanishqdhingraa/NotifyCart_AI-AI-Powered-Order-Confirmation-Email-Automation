import React, { useEffect, useState } from 'react';
import { fetchNotifications, fetchNotificationByOrderId } from '../services/api';
import { NotificationRecord, NotificationStatus } from '../types';
import {
  Bell,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Mail,
  ArrowRight,
} from 'lucide-react';

const statusStepConfig: Record<
  NotificationStatus,
  { label: string; color: string; step: number; description: string }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    step: 0,
    description: 'Order created, awaiting queue consumption.',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    step: 1,
    description: 'Email AI Service is generating confirmation email.',
  },
  AWAITING_APPROVAL: {
    label: 'Awaiting Approval',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    step: 2,
    description: 'Email draft generated. Paused in Human-in-the-Loop review queue.',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    step: 3,
    description: 'Human reviewer approved email. Preparing SMTP delivery.',
  },
  SENDING: {
    label: 'Sending',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    step: 3,
    description: 'Submitting through Nodemailer to mail server.',
  },
  SENT: {
    label: 'Sent',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    step: 4,
    description: 'SMTP server accepted email submission successfully.',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    step: 4,
    description: 'Human reviewer rejected email. Delivery cancelled.',
  },
  FAILED: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 border-red-300',
    step: 4,
    description: 'SMTP submission encountered an error.',
  },
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadNotifications = async () => {
    try {
      if (searchOrderId.trim()) {
        const single = await fetchNotificationByOrderId(searchOrderId.trim());
        setNotifications(single ? [single] : []);
      } else {
        const all = await fetchNotifications();
        setNotifications(all);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      // Handle gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [searchOrderId]);

  // Polling mechanism
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(loadNotifications, 3000); // 3-second poll
    return () => clearInterval(interval);
  }, [isPolling, searchOrderId]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title & Polling Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600" />
            <span>Order Notification Status Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tracks real-time order email lifecycle events consumed from RabbitMQ.
          </p>
        </div>

        {/* Polling Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <div className={`w-2 h-2 rounded-full ${isPolling ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            <span>Polling: {isPolling ? 'Active (every 3s)' : 'Paused'}</span>
            <button
              onClick={() => setIsPolling(!isPolling)}
              className="ml-2 font-bold text-blue-600 hover:underline"
            >
              {isPolling ? 'Pause' : 'Resume'}
            </button>
          </div>

          <button
            onClick={loadNotifications}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          placeholder="Filter by Order ID (e.g. ORD-1001)..."
          className="w-full text-sm font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
        />
        {searchOrderId && (
          <button
            onClick={() => setSearchOrderId('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Notifications Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-sm">Connecting to Notification Service on port 3003...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <Bell className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
          <p className="text-sm">No notification records found.</p>
          <p className="text-xs text-slate-500">Place an order to see its live event status here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4">Status Description</th>
                  <th className="px-6 py-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((notif) => {
                  const config = statusStepConfig[notif.status] || statusStepConfig.PENDING;

                  return (
                    <tr key={notif.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {notif.orderId}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{notif.recipientEmail}</span>
                        {notif.subject && (
                          <span className="block text-xs text-slate-400 truncate max-w-xs">
                            {notif.subject}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}
                        >
                          {notif.status === 'SENT' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : notif.status === 'REJECTED' ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          ) : notif.status === 'AWAITING_APPROVAL' ? (
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                          <span>{config.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-sm">
                        {notif.errorMessage || config.description}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(notif.updatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
            <span>Tracking {notifications.length} order notification(s)</span>
            <span>Last polled: {lastRefreshed}</span>
          </div>
        </div>
      )}

    </div>
  );
};

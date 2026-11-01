import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Inbox,
  CheckCircle,
  XCircle,
  AlertOctagon,
  ArrowRight,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { fetchOrders, fetchAllApprovals } from '../services/api';
import { Order, EmailApprovalRecord } from '../types';

export const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [approvals, setApprovals] = useState<EmailApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ordersData, approvalsData] = await Promise.all([
          fetchOrders().catch(() => []),
          fetchAllApprovals().catch(() => []),
        ]);
        setOrders(ordersData);
        setApprovals(approvalsData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const sentEmails = approvals.filter((a) => a.deliveryStatus === 'SENT');
  const rejectedEmails = approvals.filter((a) => a.status === 'REJECTED');
  const failedEmails = approvals.filter((a) => a.deliveryStatus === 'FAILED');

  const statCards = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      label: 'Awaiting Human Approval',
      value: pendingApprovals.length,
      icon: Inbox,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      badge: pendingApprovals.length > 0 ? 'Requires Action' : undefined,
    },
    {
      label: 'Emails Sent',
      value: sentEmails.length,
      icon: CheckCircle,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
    {
      label: 'Emails Rejected',
      value: rejectedEmails.length,
      icon: XCircle,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Order Automation with Human Oversight</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            OrderFlow AI Command Center
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Every order is generated with Gemini & LangChain, placed into a secure Human-in-the-Loop review queue, and delivered through Nodemailer SMTP once approved.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/place-order"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Place New Order</span>
            </Link>
            <Link
              to="/approvals"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <Inbox className="w-4 h-4" />
              <span>Review Pending Emails ({pendingApprovals.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white border ${stat.color} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stat.value}
                </span>
                {stat.badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {stat.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Approvals Callout */}
      {pendingApprovals.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-600" />
              <span>{pendingApprovals.length} email(s) currently awaiting your approval</span>
            </h3>
            <p className="text-xs text-amber-800">
              Customers are waiting for their confirmation emails. Review the generated copy, make any edits, or reject invalid requests.
            </p>
          </div>
          <Link
            to="/approvals"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shrink-0 flex items-center gap-2 shadow-sm"
          >
            <span>Open Approvals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-500">Orders submitted to the Order Service</p>
          </div>
          <Link
            to="/place-order"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Place Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
            <p className="text-sm">No orders placed yet.</p>
            <Link
              to="/place-order"
              className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              Create your first order &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-medium">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Placed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-blue-600">{ord.id}</td>
                    <td className="py-3 text-slate-900 font-medium">
                      {ord.customerName}
                      <span className="block text-xs text-slate-400">{ord.customerEmail}</span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      {ord.currency} {ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

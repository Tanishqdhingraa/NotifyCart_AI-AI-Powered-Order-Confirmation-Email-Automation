import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Inbox,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { fetchPendingApprovals } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const approvals = await fetchPendingApprovals();
        setPendingCount(approvals.length);
      } catch {
        // Silently handle if service is loading
      }
    };

    loadPendingCount();
    const interval = setInterval(loadPendingCount, 5000); // Poll every 5s for pending reviews badge
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/place-order', label: 'Place Order', icon: PlusCircle },
    { to: '/approvals', label: 'Email Approvals', icon: Inbox, badge: pendingCount },
    { to: '/notifications', label: 'Notification Status', icon: Bell },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                OrderFlow AI
              </span>
              <span className="block text-xs text-slate-400">HITL Email Automation</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {Boolean(link.badge && link.badge > 0) && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Reviewer Identity Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Reviewer:</span>
            <span className="font-semibold text-emerald-400">REV-ADMIN</span>
          </div>

        </div>
      </div>
    </header>
  );
};

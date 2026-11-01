import React, { useEffect, useState } from 'react';
import {
  fetchPendingApprovals,
  fetchAllApprovals,
  submitDecision,
} from '../services/api';
import { EmailApprovalRecord } from '../types';
import { EmailEditorModal } from '../components/EmailEditorModal';
import {
  Inbox,
  CheckCircle,
  Edit3,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  User,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<EmailApprovalRecord[]>([]);
  const [viewTab, setViewTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeEditingApproval, setActiveEditingApproval] = useState<EmailApprovalRecord | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      if (viewTab === 'PENDING') {
        const data = await fetchPendingApprovals();
        setApprovals(data);
      } else {
        const data = await fetchAllApprovals();
        setApprovals(data);
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: 'Failed to load approvals. Make sure Email AI Service is running on port 3002.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [viewTab]);

  const handleApprove = async (approvalId: string) => {
    setActionInProgress(approvalId);
    setFeedback(null);
    try {
      await submitDecision(approvalId, { action: 'APPROVE' });
      setFeedback({
        type: 'success',
        message: `Approval ${approvalId} successfully approved and submitted for delivery!`,
      });
      await loadApprovals();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error approving email',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    const reason = window.prompt('Please enter the reason for rejection:', 'The email copy requires manual revision.');
    if (reason === null) return; // User pressed cancel on prompt

    setActionInProgress(approvalId);
    setFeedback(null);
    try {
      await submitDecision(approvalId, {
        action: 'REJECT',
        reason: reason || 'Rejected by reviewer',
      });
      setFeedback({
        type: 'success',
        message: `Approval ${approvalId} rejected. Email delivery cancelled.`,
      });
      await loadApprovals();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error rejecting email',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEditSubmit = async (subject: string, body: string) => {
    if (!activeEditingApproval) return;
    setActionInProgress(activeEditingApproval.id);
    try {
      await submitDecision(activeEditingApproval.id, {
        action: 'EDIT',
        subject,
        body,
      });
      setFeedback({
        type: 'success',
        message: `Approval ${activeEditingApproval.id} edited and submitted for delivery successfully!`,
      });
      setActiveEditingApproval(null);
      await loadApprovals();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error submitting edit',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingList = approvals.filter((a) => a.status === 'PENDING');
  const displayList = viewTab === 'PENDING' ? pendingList : approvals;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-7 h-7 text-blue-600" />
            <span>Human-in-the-Loop Email Approvals</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review Gemini AI-generated email confirmation drafts before sending to customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
            <button
              onClick={() => setViewTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewTab === 'PENDING'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Reviews ({pendingList.length})
            </button>
            <button
              onClick={() => setViewTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All History
            </button>
          </div>

          <button
            onClick={loadApprovals}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 animate-slide-down ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold uppercase underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Approvals List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-sm">Loading approval requests from Email AI Service...</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {viewTab === 'PENDING' ? 'All caught up! No pending reviews.' : 'No approval records found.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When a customer places an order, the Email AI Service generates a personalized confirmation draft and queues it here for your review.
          </p>
          <Link
            to="/place-order"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >
            Create an Order to Test Workflow &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((appr) => {
            const isPending = appr.status === 'PENDING';
            const isApproved = appr.status === 'APPROVED' || appr.status === 'EDITED_AND_APPROVED';
            const isRejected = appr.status === 'REJECTED';

            return (
              <div
                key={appr.id}
                className={`bg-white rounded-2xl border transition-all p-6 space-y-5 shadow-sm hover:shadow-md ${
                  isPending ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 text-base">{appr.id}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Order: {appr.orderId}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isPending
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {appr.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(appr.createdAt).toLocaleString()}</span>
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {appr.order.currency} {appr.order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Recipient info & AI generation preview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  
                  {/* Customer Meta */}
                  <div className="space-y-2 md:border-r border-slate-100 pr-4">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Recipient</div>
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{appr.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{appr.recipientEmail}</span>
                    </div>
                    <div className="pt-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Items: </span>
                      {appr.order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  {/* Generated Email Content */}
                  <div className="md:col-span-3 space-y-3">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold block mb-0.5">
                        {appr.editedSubject ? 'Approved Subject (Edited)' : 'Generated Subject'}
                      </span>
                      <p className="font-bold text-slate-900">
                        {appr.finalSubject || appr.editedSubject || appr.originalSubject}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                      {appr.finalBody || appr.editedBody || appr.originalBody}
                    </div>

                    {appr.reviewerId && (
                      <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                        <span>Reviewed by: <strong className="text-slate-600">{appr.reviewerId}</strong></span>
                        <span>•</span>
                        <span>Status: <strong className={appr.deliveryStatus === 'SENT' ? 'text-emerald-600' : 'text-slate-600'}>{appr.deliveryStatus}</strong></span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Action Buttons for Pending Approvals */}
                {isPending && (
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                    <button
                      onClick={() => handleReject(appr.id)}
                      disabled={actionInProgress === appr.id}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => setActiveEditingApproval(appr)}
                      disabled={actionInProgress === appr.id}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Email</span>
                    </button>

                    <button
                      onClick={() => handleApprove(appr.id)}
                      disabled={actionInProgress === appr.id}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{actionInProgress === appr.id ? 'Approving...' : 'Approve & Send'}</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Edit Email Modal */}
      {activeEditingApproval && (
        <EmailEditorModal
          approval={activeEditingApproval}
          isOpen={Boolean(activeEditingApproval)}
          onClose={() => setActiveEditingApproval(null)}
          onSubmitEdit={handleEditSubmit}
          isSubmitting={actionInProgress === activeEditingApproval.id}
        />
      )}

    </div>
  );
};

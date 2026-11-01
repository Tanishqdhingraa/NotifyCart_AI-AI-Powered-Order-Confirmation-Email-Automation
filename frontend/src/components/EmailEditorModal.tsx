import React, { useState } from 'react';
import { EmailApprovalRecord } from '../types';
import { X, Send, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmailEditorModalProps {
  approval: EmailApprovalRecord;
  isOpen: boolean;
  onClose: () => void;
  onSubmitEdit: (subject: string, body: string) => Promise<void>;
  isSubmitting: boolean;
}

export const EmailEditorModal: React.FC<EmailEditorModalProps> = ({
  approval,
  isOpen,
  onClose,
  onSubmitEdit,
  isSubmitting,
}) => {
  const [subject, setSubject] = useState(approval.editedSubject || approval.originalSubject);
  const [body, setBody] = useState(approval.editedBody || approval.originalBody);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters long.');
      return;
    }
    if (body.trim().length < 10) {
      setError('Email body must be at least 10 characters long.');
      return;
    }

    setError(null);
    await onSubmitEdit(subject.trim(), body.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit AI-Generated Email</h2>
            <p className="text-xs text-slate-500">
              Order: <span className="font-semibold text-blue-600">{approval.orderId}</span> • Recipient: {approval.recipientEmail}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle View Original AI Draft */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="text-xs text-blue-900">
              <span className="font-semibold">Human-in-the-Loop Traceability:</span> Your edits will be saved separately. The original AI generation remains logged for quality audits.
            </div>
            <button
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 shrink-0 ml-3"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showOriginal ? 'Hide Original' : 'View Original AI'}</span>
            </button>
          </div>

          {showOriginal && (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-2">
              <div>
                <span className="font-bold text-slate-700">Original AI Subject:</span>
                <p className="text-slate-600">{approval.originalSubject}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">Original AI Body:</span>
                <p className="text-slate-600 whitespace-pre-wrap">{approval.originalBody}</p>
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              placeholder="Enter subject line..."
              required
            />
          </div>

          {/* Body Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-700">
                Email Message Body
              </label>
              <span className="text-xs text-slate-400">{body.length} characters</span>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-normal leading-relaxed"
              placeholder="Enter approved email body..."
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              💡 Tip: The customer's order item table and verified financial totals will be automatically attached below this message in the HTML template.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting & Sending...' : 'Approve & Send Edited Email'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Modal, Btn } from './UIComponents';
import { api } from '../api';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  RefreshCw,
  Info
} from 'lucide-react';

export const ReportShareModal = ({
  isOpen,
  onClose,
  reportType = 'analytics',
  title = 'Share Executive Report',
  filterParams = {},
  summaryData = {}
}) => {
  const [channel, setChannel] = useState('email'); // 'email' | 'whatsapp'
  const [emailTo, setEmailTo] = useState('');
  const [subject, setSubject] = useState(`AssetMS ${reportType === 'purchases' ? 'Purchase History' : 'Analytics'} Report - ${new Date().toLocaleDateString('en-IN')}`);
  const [emailMessage, setEmailMessage] = useState(`Please find attached the latest campus asset intelligence report from AssetMS.`);
  const [attachPdf, setAttachPdf] = useState(true);

  const [phone, setPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState(
    `*AssetMS Campus Report*\n\n` +
    `• *Total Procurement:* ₹${Number(summaryData.totalCapital || summaryData.totalExpenditure || 0).toLocaleString('en-IN')}\n` +
    `• *Units:* ${summaryData.totalAssets || summaryData.totalUnits || 0}\n` +
    `• *Transactions:* ${summaryData.transactionCount || summaryData.totalTransactions || 0}\n` +
    `• *Report Date:* ${new Date().toLocaleDateString('en-IN')}`
  );

  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusResult(null);

    try {
      if (channel === 'email') {
        const res = await api.sendReportEmail({
          to: emailTo,
          subject,
          message: emailMessage,
          attachPdf,
          reportType,
          filterParams
        });
        setStatusResult(res);
      } else {
        const res = await api.sendReportWhatsApp({
          phone,
          message: whatsappMessage,
          summaryData
        });
        setStatusResult(res);
      }
    } catch (err) {
      setStatusResult({
        success: false,
        message: err.message || 'Failed to dispatch report.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} defaultSize="max-w-md">
      <div className="space-y-4">
        {/* Channel Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setChannel('email'); setStatusResult(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${
              channel === 'email'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mail size={14} /> Share via Email
          </button>
          <button
            type="button"
            onClick={() => { setChannel('whatsapp'); setStatusResult(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare size={14} /> Share via WhatsApp
          </button>
        </div>

        {/* Feedback Alert if dispatched */}
        {statusResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              statusResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            {statusResult.success ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{statusResult.success ? 'Dispatch Successful' : 'Notice / Service Status'}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">{statusResult.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {channel === 'email' ? (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. principal@campus.edu or finance@campus.edu"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Cover Message
                </label>
                <textarea
                  rows="3"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="attachPdfCheck"
                  checked={attachPdf}
                  onChange={(e) => setAttachPdf(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="attachPdfCheck" className="text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer flex items-center gap-1">
                  <FileText size={13} className="text-indigo-600 dark:text-indigo-400" />
                  Attach compiled executive PDF document
                </label>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Phone Number (with Country Code) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                    <Phone size={13} />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Include country code without '+' or spaces (e.g. 91 for India)</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  WhatsApp Report Summary Content
                </label>
                <textarea
                  rows="5"
                  required
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono text-[11px]"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Btn variant="secondary" size="sm" type="button" onClick={onClose} disabled={loading} className="text-xs">
              Close
            </Btn>
            <Btn size="sm" type="submit" disabled={loading} className="text-xs">
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Dispatching...
                </>
              ) : (
                <>
                  <Send size={13} /> Send Report
                </>
              )}
            </Btn>
          </div>
        </form>
      </div>
    </Modal>
  );
};

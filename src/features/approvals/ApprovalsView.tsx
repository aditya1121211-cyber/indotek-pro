import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Can } from '../../components/shared/Can';
import { formatRupiah, formatDateIndo } from '../../utils/format';
import { ApprovalItem } from '../../types/database';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  X,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { approvals, handleProcessApproval } = useApp();
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [commentText, setCommentText] = useState('');
  const [activeApprovalId, setActiveApprovalId] = useState<string | null>(null);

  const filteredApprovals = approvals.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const handleApprove = async (id: string) => {
    await handleProcessApproval(id, 'approved', commentText || 'Disetujui sesuai prosedur');
    setActiveApprovalId(null);
    setCommentText('');
  };

  const handleReject = async (id: string) => {
    await handleProcessApproval(id, 'rejected', commentText || 'Ditolak: mohon revisi anggaran atau spesifikasi');
    setActiveApprovalId(null);
    setCommentText('');
  };

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Pusat Persetujuan & Approval
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul M
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mesin persetujuan berjenjang: Purchase Order, PR, Kasbon Proyek, Opname Mandor & Addendum Kontrak
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{pendingCount} Menunggu Persetujuan</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            filterStatus === 'pending'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Menunggu Persetujuan</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            filterStatus === 'approved'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Riwayat Disetujui</span>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            filterStatus === 'rejected'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Ditolak / Revisi</span>
        </button>

        <button
          onClick={() => setFilterStatus('all')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            filterStatus === 'all'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Semua</span>
        </button>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((app) => (
          <div
            key={app.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {app.reference_number}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {app.approval_level}
                  </span>
                  {app.urgency === 'urgent' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                      URGENT
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{app.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proyek: {app.project_name} • Diajukan oleh: {app.requester_name} ({app.requester_role})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400">Nilai Pengajuan:</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatRupiah(app.amount)}
                </p>
              </div>
            </div>

            {app.comments && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">Catatan Pemohon:</span> {app.comments}
              </div>
            )}

            {/* Actions for Pending */}
            {app.status === 'pending' ? (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-xs text-slate-400">
                  Diajukan: {formatDateIndo(app.submitted_at.split('T')[0])}
                </span>

                <Can module="approvals" action="approve">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleReject(app.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-xl text-xs transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak / Minta Revisi</span>
                    </button>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui Pengajuan</span>
                    </button>
                  </div>
                </Can>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-400">
                <span>
                  Status:{' '}
                  <strong className={app.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}>
                    {app.status.toUpperCase()}
                  </strong>
                </span>
                <span>Diproses oleh Direksi</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

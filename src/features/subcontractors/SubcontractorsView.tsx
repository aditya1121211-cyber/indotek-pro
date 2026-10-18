import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo, formatPercent } from '../../utils/format';
import { Subcontractor, SubcontractorContract, SubcontractorOpname } from '../../types/database';
import {
  Users2,
  FileCheck2,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

export const SubcontractorsView: React.FC = () => {
  const {
    currentOrg,
    subcontractors,
    subconContracts,
    subconOpnames,
    projects,
    selectedProjectId,
    handleCreateSubconOpname,
    currentRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contracts' | 'opnames' | 'directory'>('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpnameModalOpen, setIsNewOpnameModalOpen] = useState(false);

  // New Opname Form
  const [selectedContractId, setSelectedContractId] = useState(subconContracts[0]?.id || '');
  const [periodLabel, setPeriodLabel] = useState('Opname Periode 01 - 15 Oktober 2026');
  const [progressPeriod, setProgressPeriod] = useState(5.0); // %
  const [cashAdvanceDeduction, setCashAdvanceDeduction] = useState(15000000);

  const selectedContract = subconContracts.find((c) => c.id === selectedContractId) || subconContracts[0];

  // Auto-calculation for new opname
  const grossAmount = selectedContract ? (selectedContract.contract_amount * (progressPeriod / 100)) : 0;
  const retentionDeduction = grossAmount * 0.05; // 5% standard retention
  const netPayable = Math.max(0, grossAmount - retentionDeduction - Number(cashAdvanceDeduction));

  const filteredContracts = subconContracts.filter((c) => {
    const matchSearch =
      c.subcontractor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.spk_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = selectedProjectId === 'all' || c.project_id === selectedProjectId;
    return matchSearch && matchProject;
  });

  const filteredOpnames = subconOpnames.filter((o) => {
    const matchSearch =
      o.subcontractor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.opname_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = selectedProjectId === 'all' || o.project_id === selectedProjectId;
    return matchSearch && matchProject;
  });

  const handleSaveOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !selectedContract) return;

    await handleCreateSubconOpname({
      organization_id: currentOrg.id,
      project_id: selectedContract.project_id,
      contract_id: selectedContract.id,
      spk_number: selectedContract.spk_number,
      subcontractor_name: selectedContract.subcontractor_name,
      opname_number: `OPN-${currentOrg.company_code}-2026-${Math.floor(10 + Math.random() * 90)}`,
      period_label: periodLabel,
      cutoff_date: new Date().toISOString().split('T')[0],
      progress_this_period: Number(progressPeriod),
      cumulative_progress: selectedContract.cumulative_progress_percent + Number(progressPeriod),
      gross_amount: grossAmount,
      retention_deduction: retentionDeduction,
      cash_advance_deduction: Number(cashAdvanceDeduction),
      net_payable: netPayable,
      status: 'verified_by_qs',
    });

    setIsNewOpnameModalOpen(false);
  };

  const getOpnameBadge = (status: SubcontractorOpname['status']) => {
    switch (status) {
      case 'approved_by_pm':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Disetujui PM
          </span>
        );
      case 'verified_by_qs':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            <ShieldCheck className="w-3 h-3" /> Terverifikasi QS
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400">
            <DollarSign className="w-3 h-3" /> Terbayar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Diajukan
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Subkontraktor & Mandor
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul G
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan SPK borongan, opname fisik progres berkala, retensi 5%, potongan kasbon, dan termin pembayaran
          </p>
        </div>

        <button
          onClick={() => setIsNewOpnameModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Input Opname Subkon Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total SPK Subkon Aktif</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{subconContracts.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua paket borongan</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Nilai Kontrak SPK</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatRupiah(subconContracts.reduce((acc, c) => acc + c.contract_amount, 0))}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Komitmen borongan</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Realisasi Bayar</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRupiah(subconContracts.reduce((acc, c) => acc + c.total_paid, 0))}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sesuai opname disetujui</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Retensi Tersimpan (5%)</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatRupiah(subconContracts.reduce((acc, c) => acc + (c.total_paid * 0.05), 0))}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Jaminan pemeliharaan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'contracts'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daftar Kontrak SPK</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {filteredContracts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('opnames')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'opnames'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Sertifikat Opname Progres</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {filteredOpnames.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Direktori Mitra Subkon</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {subcontractors.length}
          </span>
        </button>
      </div>

      {/* Tab: SPK Contracts */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor SPK, subkon, atau lingkup kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {contract.spk_number}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">
                      {contract.subcontractor_name}
                    </h3>
                    <p className="text-xs text-slate-400">{contract.project_name}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Aktif
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {contract.scope_of_work}
                </p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Nilai Kontrak:</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatRupiah(contract.contract_amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Realisasi Dibayar:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatRupiah(contract.total_paid)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progres Opname Kumulatif</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatPercent(contract.cumulative_progress_percent)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, contract.cumulative_progress_percent)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>Masa Kontrak: {formatDateIndo(contract.start_date)} s/d {formatDateIndo(contract.end_date)}</span>
                  <span>Retensi: {contract.retention_percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Opnames */}
      {activeTab === 'opnames' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Opname & Periode</th>
                  <th className="py-3 px-4">Subkontraktor & SPK</th>
                  <th className="py-3 px-4 text-center">Progres Periode Ini</th>
                  <th className="py-3 px-4 text-right">Nilai Bruto</th>
                  <th className="py-3 px-4 text-right">Potongan (Retensi & Kasbon)</th>
                  <th className="py-3 px-4 text-right">Nilai Bersih Cair</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOpnames.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{o.opname_number}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">{o.period_label}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">{o.subcontractor_name}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">{o.spk_number}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        +{o.progress_this_period}%
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        Kumulatif: {o.cumulative_progress}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-xs text-slate-700 dark:text-slate-300">
                      {formatRupiah(o.gross_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-rose-500">
                      - {formatRupiah(o.retention_deduction + o.cash_advance_deduction)}
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Retensi: {formatRupiah(o.retention_deduction)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(o.net_payable)}
                    </td>
                    <td className="py-3.5 px-4">{getOpnameBadge(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Directory */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subcontractors.map((sub) => (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {sub.trade_specialty}
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{sub.company_name}</h4>
                <p className="text-xs text-slate-400">PIC / Mandor: {sub.pic_name}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sub.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sub.email}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>Rekening: {sub.bank_name} {sub.bank_account_no} a/n {sub.bank_account_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Opname Modal */}
      {isNewOpnameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Input Sertifikat Opname Subkon</h3>
              <button onClick={() => setIsNewOpnameModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveOpname} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih SPK Subkontraktor
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  {subconContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.subcontractor_name} - {c.spk_number} ({formatRupiah(c.contract_amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Label Periode</label>
                <input
                  type="text"
                  required
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Progres Periode Ini (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    required
                    value={progressPeriod}
                    onChange={(e) => setProgressPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Potongan Kasbon / Material (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashAdvanceDeduction}
                    onChange={(e) => setCashAdvanceDeduction(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              {/* Automatic Calculation Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Nilai Bruto Hasil Progres:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(grossAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Potongan Retensi (5%):</span>
                  <span className="text-rose-500 font-semibold">- {formatRupiah(retentionDeduction)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Potongan Kasbon / Alat:</span>
                  <span className="text-rose-500 font-semibold">- {formatRupiah(cashAdvanceDeduction)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Nilai Bersih Cair (Net):</span>
                  <span>{formatRupiah(netPayable)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpnameModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition"
                >
                  Simpan & Verifikasi Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

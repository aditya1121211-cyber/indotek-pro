import React from 'react';
import { useApp } from '../../context/AppContext';
import { Can } from '../../components/shared/Can';
import { formatRupiah, formatPercent, formatDateIndo } from '../../utils/format';
import { calculateProjectHealth, calculateBudgetMetrics } from '../../utils/projectCalculations';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  DollarSign,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  Activity,
  Plus,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const DashboardView: React.FC<{
  onOpenCreateProject: () => void;
}> = ({ onOpenCreateProject }) => {
  const {
    currentOrg,
    projects,
    auditLogs,
    openProjectDetail,
    selectedProjectId,
    currentRole,
    isDark,
  } = useApp();

  // Filter projects if specific project selected in topbar
  const displayedProjects =
    selectedProjectId === 'all'
      ? projects
      : projects.filter((p) => p.id === selectedProjectId);

  // Aggregated KPIs
  const totalContract = displayedProjects.reduce((acc, p) => acc + p.contract_value, 0);
  const totalCost = displayedProjects.reduce((acc, p) => acc + p.realized_cost, 0);
  const avgPlanned =
    displayedProjects.length > 0
      ? displayedProjects.reduce((acc, p) => acc + p.planned_progress, 0) / displayedProjects.length
      : 0;
  const avgActual =
    displayedProjects.length > 0
      ? displayedProjects.reduce((acc, p) => acc + p.actual_progress, 0) / displayedProjects.length
      : 0;
  const avgDeviation = avgActual - avgPlanned;

  const activeProjectsCount = displayedProjects.filter((p) => p.status === 'active').length;
  const delayedProjects = displayedProjects.filter(
    (p) => p.status === 'delayed' || p.actual_progress < p.planned_progress - 3
  );

  // Chart data
  const progressChartData = displayedProjects.map((p) => ({
    name: p.code.replace('PRJ-IKN-2026-', 'PRJ-').replace('PRJ-IKN-2025-', 'PRJ-'),
    fullName: p.name,
    rencana: p.planned_progress,
    aktual: p.actual_progress,
  }));

  const budgetChartData = displayedProjects.map((p) => ({
    name: p.code.replace('PRJ-IKN-2026-', 'PRJ-').replace('PRJ-IKN-2025-', 'PRJ-'),
    anggaran: Math.round(p.contract_value / 1000000000), // in Miliar
    realisasi: Math.round(p.realized_cost / 1000000000),
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
              {currentOrg?.company_code || 'IKN'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Sistem Operasional Terintegrasi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            {currentOrg?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Monitoring kinerja portofolio proyek konstruksi, deviasi kurva S, serapan anggaran, dan aktivitas lapangan secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Can module="projects" action="create">
            <button
              onClick={onOpenCreateProject}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Proyek</span>
            </button>
          </Can>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Nilai Kontrak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Nilai Kontrak
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {formatRupiah(totalContract)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{displayedProjects.length} Proyek terdaftar</span>
            </p>
          </div>
        </div>

        {/* Realisasi Biaya */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Realisasi Biaya (Cost)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {formatRupiah(totalCost)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Serapan Anggaran:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {totalContract > 0 ? ((totalCost / totalContract) * 100).toFixed(1) : '0'}%
              </strong>
            </p>
          </div>
        </div>

        {/* Rata-rata Progres Fisik vs Rencana */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rata-rata Progres Fisik
            </span>
            <div
              className={`p-2 rounded-xl ${
                avgDeviation >= 0
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {formatPercent(avgActual)}
              </p>
              <span className="text-xs text-slate-400">
                (Rencana {formatPercent(avgPlanned)})
              </span>
            </div>
            <p
              className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                avgDeviation >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {avgDeviation >= 0 ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" /> Deviasi +{avgDeviation.toFixed(1)}% (Aman)
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5" /> Deviasi {avgDeviation.toFixed(1)}% (Kritis)
                </>
              )}
            </p>
          </div>
        </div>

        {/* Status Proyek */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Kondisi Portofolio
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {activeProjectsCount} Proyek Aktif
            </p>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {delayedProjects.length} Terlambat
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {displayedProjects.filter((p) => p.status === 'completed' || p.status === 'maintenance').length} Selesai
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progres Fisik vs Rencana Per Proyek */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Kurva Progres Proyek (Rencana vs Aktual %)
              </h2>
              <p className="text-xs text-slate-500">Bobot pencapaian fisik konstruksi</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.1 : 0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, '']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="rencana" name="Rencana %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aktual" name="Realisasi Aktual %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anggaran vs Realisasi Biaya (Miliar Rupiah) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Nilai Kontrak vs Realisasi Biaya
              </h2>
              <p className="text-xs text-slate-500">Satuan: Miliar Rupiah (Rp M)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.1 : 0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="M" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`Rp ${val} Miliar`, '']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="anggaran" name="Nilai Kontrak (Rp M)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realisasi" name="Realisasi Biaya (Rp M)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Proyek Membutuhkan Perhatian / Kritis */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Proyek Kritis / Terlambat
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {delayedProjects.length} Perlu Tindakan
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {delayedProjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                Semua proyek berjalan sesuai atau melampaui jadwal rencana!
              </div>
            ) : (
              delayedProjects.map((p) => {
                const health = calculateProjectHealth(p.actual_progress, p.planned_progress);
                return (
                  <div
                    key={p.id}
                    onClick={() => openProjectDetail(p.id)}
                    className="p-3 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </p>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        {health.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {p.notes || 'Perlu evaluasi schedule kompresi dan penambahan kapasitas alat.'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>PM: {p.project_manager_name || 'Tim Proyek'}</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Detail Proyek →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Widget 2: Dokumen Legal & Jaminan Kedaluwarsa */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Jaminan & Asuransi Kritis
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Masa Berlaku</span>
          </div>

          <div className="mt-3 space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Jaminan Pelaksanaan (Bank Garansi)
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Sisa 28 Hari
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Menara Mandiri Sentosa (Bank Mandiri - Rp 2.425.000.000)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Polis Asuransi CAR (Contractor All Risk)
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Aktif (Des 2026)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Flyover Simpang Raya KM 14 (Asuransi Jasindo)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Masa Pemeliharaan / Retensi 5%
                </span>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-500/10 px-1.5 py-0.5 rounded">
                  Selesai Nov 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Gudang Logistik Cikupa (Klaim retensi Rp 625.000.000)
              </p>
            </div>
          </div>
        </div>

        {/* Widget 3: Audit Log & Aktivitas Terkini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Aktivitas & Log Kepatuhan
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Waktu Indonesia</span>
          </div>

          <div className="mt-3 space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="text-xs border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-none">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.user_name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateIndo(log.created_at, true).split(',')[1]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

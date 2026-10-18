import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Can } from '../../components/shared/Can';
import { Project, ProjectStatus } from '../../types/database';
import { formatRupiah, formatPercent, formatDateIndo } from '../../utils/format';
import { calculateProjectHealth, calculateBudgetMetrics } from '../../utils/projectCalculations';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';

export const ProjectListView: React.FC<{
  onOpenCreateProject: () => void;
  onEditProject: (project: Project) => void;
}> = ({ onOpenCreateProject, onEditProject }) => {
  const { projects, openProjectDetail, handleDeleteProject } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter logic
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase()) ||
      p.location_city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Manajemen Proyek Konstruksi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola SPK, kurva S, amandemen kontrak, dan timeline lapangan seluruh proyek
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Tampilan Grid Card"
              aria-label="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Tampilan Tabel Data"
              aria-label="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <Can module="projects" action="create">
            <button
              onClick={onOpenCreateProject}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Proyek Baru</span>
            </button>
          </Can>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode proyek, nama, klien, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Sedang Berjalan</option>
            <option value="delayed">Kritis / Terlambat</option>
            <option value="planning">Perencanaan</option>
            <option value="maintenance">Masa Pemeliharaan</option>
            <option value="completed">Selesai</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="Gedung">Gedung</option>
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="Renovasi">Renovasi</option>
            <option value="MEP">MEP</option>
          </select>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tidak ada proyek yang cocok
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan kembali proyek.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const health = calculateProjectHealth(
              project.actual_progress,
              project.planned_progress
            );
            const budgetMetrics = calculateBudgetMetrics(
              project.contract_value,
              project.realized_cost
            );

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500/40 dark:hover:border-amber-500/30 transition overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top: Code & Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {project.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        project.status === 'active'
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : project.status === 'delayed'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {project.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Name & Client */}
                  <div>
                    <h3
                      onClick={() => openProjectDetail(project.id)}
                      className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-500 transition cursor-pointer"
                    >
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span>{project.client_name}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{project.location_city}, {project.location_province}</span>
                    </p>
                  </div>

                  {/* Contract Value & Realized */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Nilai Kontrak:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {formatRupiah(project.contract_value)}
                      </strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Realisasi Biaya:</span>
                      <span>{formatRupiah(project.realized_cost)}</span>
                    </div>
                  </div>

                  {/* Progress Bar & Deviation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Progres Fisik</span>
                      <span className="text-amber-500">
                        {formatPercent(project.actual_progress)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, project.actual_progress))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Rencana: {formatPercent(project.planned_progress)}</span>
                      <span
                        className={`font-semibold ${
                          health.badgeColor === 'rose' ? 'text-rose-500' : 'text-emerald-500'
                        }`}
                      >
                        {health.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Selesai: {formatDateIndo(project.end_date)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Can module="projects" action="edit">
                      <button
                        onClick={() => onEditProject(project)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Proyek"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </Can>
                    <button
                      onClick={() => openProjectDetail(project.id)}
                      className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline text-xs"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Data Table View */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kode & Proyek</th>
                  <th className="px-4 py-3">Klien / Owner</th>
                  <th className="px-4 py-3">Nilai Kontrak</th>
                  <th className="px-4 py-3">Realisasi Biaya</th>
                  <th className="px-4 py-3">Progres (Aktual / Rencana)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((project) => {
                  const health = calculateProjectHealth(
                    project.actual_progress,
                    project.planned_progress
                  );
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[10px] font-bold text-amber-500 block">
                          {project.code}
                        </span>
                        <span
                          onClick={() => openProjectDetail(project.id)}
                          className="font-bold text-slate-900 dark:text-white hover:text-amber-500 cursor-pointer"
                        >
                          {project.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {project.client_name}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {formatRupiah(project.contract_value)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {formatRupiah(project.realized_cost)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-500">
                            {formatPercent(project.actual_progress)}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            ({formatPercent(project.planned_progress)})
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-semibold ${
                            health.badgeColor === 'rose' ? 'text-rose-500' : 'text-emerald-500'
                          }`}
                        >
                          {health.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            project.status === 'active'
                              ? 'bg-sky-500/10 text-sky-600'
                              : project.status === 'delayed'
                              ? 'bg-rose-500/10 text-rose-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {project.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <Can module="projects" action="edit">
                          <button
                            onClick={() => onEditProject(project)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                            aria-label={`Edit proyek ${project.name}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                        <button
                          onClick={() => openProjectDetail(project.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/20"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

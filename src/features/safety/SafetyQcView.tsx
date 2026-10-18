import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../utils/format';
import { SafetyIncident, ToolboxMeeting, PunchListItem } from '../../types/database';
import {
  ShieldAlert,
  ShieldCheck,
  HardHat,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  Camera,
  Calendar,
  X,
  FileCheck2,
} from 'lucide-react';

export const SafetyQcView: React.FC = () => {
  const {
    currentOrg,
    safetyIncidents,
    toolboxMeetings,
    punchList,
    projects,
    selectedProjectId,
    handleUpdatePunchListStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'punch_list' | 'k3_incidents' | 'toolbox'>('punch_list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPunchList = punchList.filter((item) => {
    const matchSearch =
      item.defect_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assigned_to_subcon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchProject = selectedProjectId === 'all' || item.project_id === selectedProjectId;
    return matchSearch && matchStatus && matchProject;
  });

  const openCount = punchList.filter((p) => p.status === 'open').length;
  const inProgressCount = punchList.filter((p) => p.status === 'in_progress').length;
  const closedCount = punchList.filter((p) => p.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              K3, Kontrol Kualitas & Punch List
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul K
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keselamatan Kerja (HSE/K3), Zero Accident, Toolbox Meeting, Checklist QC & Penanganan Cacat Pekerjaan (Defect List)
          </p>
        </div>
      </div>

      {/* Safety Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Zero Accident</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">184.200</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Jam Kerja Selamat Akumulatif (Safe Man-Hours)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Insiden / Near-Miss</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{safetyIncidents.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua telah ditindaklanjuti (Closed)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Temuan Punch List Aktif</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{openCount + inProgressCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{openCount} Baru • {inProgressCount} Dikerjakan</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Punch List Diselesaikan</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{closedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Telah diinspeksi & diverifikasi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('punch_list')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'punch_list'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Punch List & Defect Management</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {filteredPunchList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('k3_incidents')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'k3_incidents'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Laporan Insiden & K3</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {safetyIncidents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('toolbox')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'toolbox'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Toolbox Meeting K3</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {toolboxMeetings.length}
          </span>
        </button>
      </div>

      {/* Tab: Punch List */}
      {activeTab === 'punch_list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari temuan defect, lokasi, atau subkon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="open">Open (Baru)</option>
                <option value="in_progress">Dalam Perbaikan</option>
                <option value="ready_for_inspection">Siap Inspeksi</option>
                <option value="closed">Closed (Selesai)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPunchList.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {item.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.severity === 'critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : item.severity === 'major'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.severity.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                      {item.category} • {item.location_zone}
                    </h4>
                    <p className="text-xs text-slate-400">{item.project_name}</p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      item.status === 'closed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : item.status === 'ready_for_inspection'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                        : item.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {item.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {item.defect_description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <span className="text-slate-400">PIC Perbaikan:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {item.assigned_to_subcon}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tenggat Waktu:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatDateIndo(item.due_date)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pelapor: {item.reported_by}</span>
                  <div className="flex items-center gap-1.5">
                    {item.status !== 'closed' && (
                      <button
                        onClick={() => handleUpdatePunchListStatus(item.id, 'closed')}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition"
                      >
                        Tandai Selesai (Closed)
                      </button>
                    )}
                    {item.status === 'open' && (
                      <button
                        onClick={() => handleUpdatePunchListStatus(item.id, 'in_progress')}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition"
                      >
                        Mulai Perbaikan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: K3 Incidents */}
      {activeTab === 'k3_incidents' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Buku Log Insiden & Near-Miss Keselamatan Kerja
            </h3>

            <div className="space-y-3">
              {safetyIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{inc.incident_number}</span>
                        <span className="px-2 py-0.5 rounded-md font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          {inc.category}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{inc.project_name} • Lokasi: {inc.location}</p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Status: Closed
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mt-1">{inc.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 font-medium">Tindakan Langsung:</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{inc.immediate_action}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Tindakan Korektif (Pencegahan):</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{inc.corrective_action}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    Dilaporkan oleh: {inc.reporter_name} • Tanggal: {formatDateIndo(inc.incident_date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Toolbox Meeting */}
      {activeTab === 'toolbox' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Dokumentasi & Notulen Harian K3 (Toolbox Safety Meeting)
          </h3>

          <div className="space-y-4">
            {toolboxMeetings.map((tbm) => (
              <div
                key={tbm.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400">{formatDateIndo(tbm.meeting_date)}</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{tbm.topic}</h4>
                    <p className="text-slate-500 mt-0.5">{tbm.project_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                      {tbm.attendees_count} Pekerja Hadir
                    </span>
                    <span className="block text-[11px] text-slate-400">Instruktur: {tbm.presenter_name}</span>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Materi & Poin Penting Keselamatan:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                    {tbm.key_points.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

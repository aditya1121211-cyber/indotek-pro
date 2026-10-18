import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../utils/format';
import { FieldWorker, DailyAttendance } from '../../types/database';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  FileSpreadsheet,
} from 'lucide-react';

export const HrManpowerView: React.FC = () => {
  const { currentOrg, fieldWorkers, dailyAttendances, projects, selectedProjectId } = useApp();
  const [activeTab, setActiveTab] = useState<'attendance' | 'workers' | 'payroll'>('attendance');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('2026-10-16');

  const filteredWorkers = fieldWorkers.filter((w) => {
    const matchSearch =
      w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.role_trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.origin_city && w.origin_city.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchProject = selectedProjectId === 'all' || w.project_id === selectedProjectId;
    return matchSearch && matchProject;
  });

  const totalDailyEarnings = dailyAttendances.reduce((acc, a) => acc + a.daily_earnings, 0);
  const presentCount = dailyAttendances.filter((a) => a.status === 'hadir' || a.status === 'lembur').length;
  const overtimeCount = dailyAttendances.filter((a) => a.overtime_hours > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              SDM & Absensi Lapangan
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul I
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manajemen tenaga kerja mandor & tukang, absensi harian site, jam lembur, dan rekapitulasi upah mingguan
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tenaga Kerja Site</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{fieldWorkers.length} Orang</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tukang & mandor terdaftar</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Tingkat Kehadiran Harian</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {presentCount} / {fieldWorkers.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Hadir di lokasi kerja hari ini</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Pekerja Lembur (Overtime)</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{overtimeCount} Orang</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pengecoran & percepatan jadwal</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Upah Hari Ini</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatRupiah(totalDailyEarnings)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pokok + uang lembur</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Absensi Harian Pekerja</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'workers'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Tukang & Mandor</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {filteredWorkers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'payroll'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Rekap Upah Mingguan (Payroll)</span>
        </button>
      </div>

      {/* Tab: Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Catatan Presensi & Jam Lembur: {formatDateIndo(attendanceDate)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Pilih Tanggal:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Pekerja</th>
                  <th className="py-3 px-4">Keahlian (Trade)</th>
                  <th className="py-3 px-4">Status Kehadiran</th>
                  <th className="py-3 px-4 text-center">Jam Kerja Reguler</th>
                  <th className="py-3 px-4 text-center">Jam Lembur</th>
                  <th className="py-3 px-4 text-right">Penghasilan Hari Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dailyAttendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-xs text-slate-900 dark:text-white">
                      {att.worker_name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {att.role_trade}
                    </td>
                    <td className="py-3 px-4">
                      {att.status === 'lembur' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                          Hadir + Lembur
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Hadir Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-medium">{att.work_hours} Jam</td>
                    <td className="py-3 px-4 text-center text-xs font-bold text-amber-600 dark:text-amber-400">
                      {att.overtime_hours > 0 ? `+${att.overtime_hours} Jam` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(att.daily_earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Workers Directory */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((w) => (
            <div
              key={w.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {w.role_trade}
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{w.full_name}</h4>
                <p className="text-xs text-slate-400">NIK: {w.nik}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Upah Harian:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatRupiah(w.daily_wage_rate)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tarif Lembur/Jam:</span>
                  <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatRupiah(w.overtime_hourly_rate)}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex justify-between">
                <span>Asal: {w.origin_city || 'Jawa'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Aktif Lapangan</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Payroll */}
      {activeTab === 'payroll' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Rekapitulasi Upah Mingguan Mandor & Tukang
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Periode: Minggu Ke-41 (06 - 12 Oktober 2026)</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
              Status: Disetujui PM & Dibayarkan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Total Hari Orang Kerja (Mandays):</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">284 Mandays</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Total Upah Pokok:</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatRupiah(52600000)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Total Upah Lembur:</span>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatRupiah(15900000)}</p>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Grand Total Payroll Mandor & Tukang:
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {formatRupiah(68500000)}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Cetak Slip Upah
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

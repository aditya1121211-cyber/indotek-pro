import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailySiteReport } from '../../types/database';
import { formatDateIndo } from '../../utils/format';
import {
  HardHat,
  Calendar,
  CloudSun,
  CloudRain,
  Sun,
  Users,
  Wrench,
  Boxes,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Camera,
  FileText,
  Printer,
  X,
  Search,
  PenTool,
  Clock,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { SCurveProgressView } from './SCurveProgressView';

export const DailyReportsView: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    dailyReports,
    handleCreateDailyReport,
    currentOrg,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reports' | 'scurve'>('reports');
  const [selectedReport, setSelectedReport] = useState<DailySiteReport | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for new daily report
  const activeProject =
    projects.find((p) => p.id === (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id)) ||
    projects[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(todayStr);
  const [weatherMorning, setWeatherMorning] = useState('Cerah');
  const [weatherAfternoon, setWeatherAfternoon] = useState('Cerah Berawan');
  const [weatherEvening, setWeatherEvening] = useState('Berawan');
  const [workDesc, setWorkDesc] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [solutions, setSolutions] = useState('');
  const [siteManager, setSiteManager] = useState('Rian Pratama, ST');
  const [inspector, setInspector] = useState('Ir. Taufik Hidayat (MK)');

  // Manpower state
  const [tukangBatu, setTukangBatu] = useState('12');
  const [tukangBesi, setTukangBesi] = useState('20');
  const [tukangKayu, setTukangKayu] = useState('16');
  const [pekerja, setPekerja] = useState('32');
  const [mandor, setMandor] = useState('3');

  // Material state
  const [matName, setMatName] = useState('Beton Ready Mix K-350');
  const [matVol, setMatVol] = useState('80');
  const [matUnit, setMatUnit] = useState('m3');
  const [matSupplier, setMatSupplier] = useState('PT Pionirbeton Industri');
  const [matSJ, setMatSJ] = useState('SJ-9982');

  const filteredReports = dailyReports.filter(
    (r) => r.project_id === activeProject?.id
  );

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !currentOrg) return;

    const dateFormatted = reportDate.replace(/-/g, '/');
    const repNum = `LH/${currentOrg.company_code}/${dateFormatted}`;

    await handleCreateDailyReport({
      organization_id: currentOrg.id,
      project_id: activeProject.id,
      report_number: repNum,
      report_date: reportDate,
      weather_morning: weatherMorning,
      weather_afternoon: weatherAfternoon,
      weather_evening: weatherEvening,
      work_description: workDesc || 'Pekerjaan konstruksi dan monitoring lapangan harian.',
      obstacles,
      solutions,
      site_manager_name: siteManager,
      inspector_name: inspector,
      status: 'approved',
      signature_site_manager: `sign_${siteManager.replace(/\s+/g, '_')}`,
      signature_inspector: `sign_${inspector.replace(/\s+/g, '_')}`,
      manpower: [
        { id: `mp-${Date.now()}-1`, report_id: '', trade_type: 'Mandor', headcount: parseInt(mandor, 10) || 1, work_hours: 8 },
        { id: `mp-${Date.now()}-2`, report_id: '', trade_type: 'Tukang Batu', headcount: parseInt(tukangBatu, 10) || 0, work_hours: 8 },
        { id: `mp-${Date.now()}-3`, report_id: '', trade_type: 'Tukang Besi', headcount: parseInt(tukangBesi, 10) || 0, work_hours: 8 },
        { id: `mp-${Date.now()}-4`, report_id: '', trade_type: 'Tukang Kayu', headcount: parseInt(tukangKayu, 10) || 0, work_hours: 8 },
        { id: `mp-${Date.now()}-5`, report_id: '', trade_type: 'Pekerja/Kenek', headcount: parseInt(pekerja, 10) || 0, work_hours: 8 },
      ],
      equipment: [
        { id: `eq-${Date.now()}-1`, report_id: '', equipment_name: 'Tower Crane 6 Ton', quantity: 2, active_hours: 8, standby_hours: 0 },
        { id: `eq-${Date.now()}-2`, report_id: '', equipment_name: 'Concrete Vibrator', quantity: 3, active_hours: 6, standby_hours: 2 },
      ],
      materials: matName ? [
        { id: `mat-${Date.now()}-1`, report_id: '', material_name: matName, volume: parseFloat(matVol) || 0, unit: matUnit, supplier_name: matSupplier, delivery_note_no: matSJ }
      ] : [],
      photos: [
        { id: `ph-${Date.now()}-1`, report_id: '', photo_url: '/placeholder-construction.svg', caption: 'Dokumentasi pekerjaan lapangan', zone_location: 'Area Utama', created_at: new Date().toISOString() }
      ],
    });

    setIsCreateModalOpen(false);
    setWorkDesc('');
    setObstacles('');
    setSolutions('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-500">{activeProject?.code}</span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500">{activeProject?.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Laporan Lapangan & Progres Fisik
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan harian cuaca, tenaga kerja, alat, material, kendala, foto, dan kurva S otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-[200px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          {activeTab === 'reports' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan Harian</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Laporan Harian Lapangan ({filteredReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scurve')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'scurve'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Kurva S & Opname Progres Fisik</span>
        </button>
      </div>

      {/* VIEW: S-CURVE TAB */}
      {activeTab === 'scurve' && <SCurveProgressView projectId={activeProject?.id || 'prj-001'} />}

      {/* VIEW: DAILY REPORTS LIST */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Report List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Daftar Laporan Harian
            </h3>

            {filteredReports.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Belum ada laporan harian untuk proyek ini. Klik tombol "+ Buat Laporan Harian".
              </div>
            ) : (
              <div className="space-y-2">
                {filteredReports.map((r) => {
                  const isSelected = (selectedReport?.id || filteredReports[0]?.id) === r.id;
                  const totalManpower = r.manpower?.reduce((acc: number, m: { headcount: number }) => acc + m.headcount, 0) || 0;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`p-4 rounded-2xl border transition cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {r.report_number}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Disetujui MK
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateIndo(r.report_date)}</span>
                        <span>•</span>
                        <span>Cuaca: {r.weather_morning}</span>
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{totalManpower} Pekerja</span>
                        </span>
                        <span>Pelaksana: {r.site_manager_name.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detailed View of Selected Report */}
          <div className="lg:col-span-2">
            {(() => {
              const report = selectedReport || filteredReports[0];
              if (!report) return null;

              const totalManpower = report.manpower?.reduce((acc: number, m: { headcount: number }) => acc + m.headcount, 0) || 0;

              return (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  {/* Top Report Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                          Laporan Resmi Kontraktor
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {report.report_number}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        Laporan Harian Proyek: {formatDateIndo(report.report_date)}
                      </h2>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-fit"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Format PUPR</span>
                    </button>
                  </div>

                  {/* Weather Banner */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Pagi (08:00 - 12:00)</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" /> {report.weather_morning}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Siang (13:00 - 17:00)</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                        <CloudSun className="w-3.5 h-3.5 text-sky-500" /> {report.weather_afternoon}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Sore/Malam</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-indigo-400" /> {report.weather_evening}
                      </p>
                    </div>
                  </div>

                  {/* Work Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-500" />
                      Uraian Pekerjaan yang Dilaksanakan
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {report.work_description}
                    </div>
                  </div>

                  {/* Manpower & Equipment Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tenaga Kerja */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-500" />
                          Tenaga Kerja Lapangan
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Total {totalManpower} Orang
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {report.manpower?.map((m: { id: string; trade_type: string; headcount: number; work_hours: number }) => (
                          <div key={m.id} className="py-1.5 flex justify-between">
                            <span className="text-slate-600 dark:text-slate-300">{m.trade_type}</span>
                            <span className="font-bold font-mono">{m.headcount} Orang ({m.work_hours} Jam)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alat Berat & Kerja */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-blue-500" />
                          Peralatan di Lapangan
                        </span>
                        <span className="text-[10px] text-slate-400">{report.equipment?.length || 0} Jenis</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {report.equipment?.map((eq: { id: string; equipment_name: string; quantity: number; active_hours: number }) => (
                          <div key={eq.id} className="py-1.5 flex justify-between">
                            <span className="text-slate-600 dark:text-slate-300">{eq.equipment_name}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {eq.quantity} Unit ({eq.active_hours} Jam Aktif)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Material Masuk */}
                  {report.materials && report.materials.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-emerald-500" />
                        Penerimaan Material Masuk Hari Ini
                      </h3>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {report.materials.map((mat: { id: string; material_name: string; supplier_name: string; delivery_note_no: string; volume: number; unit: string }) => (
                            <div key={mat.id} className="py-2 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{mat.material_name}</p>
                                <p className="text-[10px] text-slate-400">
                                  Supplier: {mat.supplier_name} • No. Surat Jalan: {mat.delivery_note_no}
                                </p>
                              </div>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                +{mat.volume} {mat.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kendala & Solusi */}
                  {report.obstacles && (
                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Kendala & Solusi Lapangan:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong>Kendala: </strong>{report.obstacles}
                      </p>
                      {report.solutions && (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          <strong>Tindakan Penyelesaian: </strong>{report.solutions}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Foto Dokumentasi */}
                  {report.photos && report.photos.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-sky-500" />
                        Dokumentasi Visual Lapangan
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {report.photos.map((ph: { id: string; photo_url: string; caption: string; zone_location?: string }) => (
                          <div key={ph.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                            <div className="h-44 bg-slate-900 relative">
                              <img
                                src={ph.photo_url}
                                alt={ph.caption}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              {ph.zone_location && (
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                                  {ph.zone_location}
                                </span>
                              )}
                            </div>
                            <div className="p-2.5 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200">
                              {ph.caption}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Digital Signature Footer */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-center text-xs">
                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                      <p className="text-[10px] text-slate-400">Disusun oleh Site Manager Kontraktor</p>
                      <div className="h-12 flex items-center justify-center font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs italic">
                        [ Terverifikasi Digital ]
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">{report.site_manager_name}</p>
                      <p className="text-[10px] text-slate-400">PT. Indotek Karya Nusantara</p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                      <p className="text-[10px] text-slate-400">Disetujui Pengawas / Konsultan MK</p>
                      <div className="h-12 flex items-center justify-center font-mono text-sky-600 dark:text-sky-400 font-bold text-xs italic">
                        [ Terverifikasi Digital ]
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">{report.inspector_name || 'Konsultan MK'}</p>
                      <p className="text-[10px] text-slate-400">Pengawas Lapangan</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL: BUAT LAPORAN HARIAN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Buat Laporan Harian Lapangan Baru
                  </h3>
                  <p className="text-xs text-slate-500">Proyek: {activeProject?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tanggal Laporan</label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Cuaca Pagi</label>
                  <select
                    value={weatherMorning}
                    onChange={(e) => setWeatherMorning(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  >
                    <option value="Cerah">Cerah</option>
                    <option value="Cerah Berawan">Cerah Berawan</option>
                    <option value="Hujan Ringan">Hujan Ringan</option>
                    <option value="Hujan Lebat">Hujan Lebat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Cuaca Siang</label>
                  <select
                    value={weatherAfternoon}
                    onChange={(e) => setWeatherAfternoon(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  >
                    <option value="Cerah">Cerah</option>
                    <option value="Cerah Berawan">Cerah Berawan</option>
                    <option value="Hujan Ringan">Hujan Ringan</option>
                    <option value="Hujan Lebat">Hujan Lebat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Cuaca Sore/Malam</label>
                  <select
                    value={weatherEvening}
                    onChange={(e) => setWeatherEvening(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  >
                    <option value="Berawan">Berawan</option>
                    <option value="Cerah">Cerah</option>
                    <option value="Hujan Ringan">Hujan Ringan</option>
                    <option value="Hujan Lebat">Hujan Lebat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Uraian Detail Pekerjaan Hari Ini <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="1. Pengecoran plat lantai 12...\n2. Pemasangan hebel...\n3. Instalasi pipa air..."
                  value={workDesc}
                  onChange={(e) => setWorkDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>

              {/* Tenaga Kerja */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold block">Tenaga Kerja Lapangan (Jumlah Orang)</span>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400">Mandor</label>
                    <input
                      type="number"
                      value={mandor}
                      onChange={(e) => setMandor(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Tk. Batu</label>
                    <input
                      type="number"
                      value={tukangBatu}
                      onChange={(e) => setTukangBatu(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Tk. Besi</label>
                    <input
                      type="number"
                      value={tukangBesi}
                      onChange={(e) => setTukangBesi(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Tk. Kayu</label>
                    <input
                      type="number"
                      value={tukangKayu}
                      onChange={(e) => setTukangKayu(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Pekerja</label>
                    <input
                      type="number"
                      value={pekerja}
                      onChange={(e) => setPekerja(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Material Masuk */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold block">Penerimaan Material Hari Ini (Opsional)</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <input
                      type="text"
                      placeholder="Nama Material (misal: Beton K-350)"
                      value={matName}
                      onChange={(e) => setMatName(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Volume & Satuan (80 m3)"
                      value={matVol}
                      onChange={(e) => setMatVol(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Supplier / No Surat Jalan"
                      value={matSupplier}
                      onChange={(e) => setMatSupplier(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border"
                    />
                  </div>
                </div>
              </div>

              {/* Kendala & Solusi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kendala di Lapangan</label>
                  <textarea
                    rows={2}
                    placeholder="Kendala cuaca, alat rusak, atau gambar..."
                    value={obstacles}
                    onChange={(e) => setObstacles(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tindakan / Solusi</label>
                  <textarea
                    rows={2}
                    placeholder="Tindakan korektif yang diambil..."
                    value={solutions}
                    onChange={(e) => setSolutions(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 font-bold text-slate-950 text-xs shadow"
                >
                  Kirim Laporan Harian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

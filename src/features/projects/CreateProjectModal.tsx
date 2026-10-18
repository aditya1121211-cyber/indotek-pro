import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types/database';
import { formatRupiah, parseRupiah } from '../../utils/format';
import { X, Building2, Plus, Calendar, DollarSign, MapPin, UserCheck } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { currentOrg, handleCreateProject, handleUpdateProject, members } = useApp();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [category, setCategory] = useState<Project['category']>('Gedung');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationProvince, setLocationProvince] = useState('');
  const [contractValueRaw, setContractValueRaw] = useState('');
  const [realizedCostRaw, setRealizedCostRaw] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maintenanceDays, setMaintenanceDays] = useState('180');
  const [retentionPercent, setRetentionPercent] = useState('5');
  const [plannedProgress, setPlannedProgress] = useState('0');
  const [actualProgress, setActualProgress] = useState('0');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [pmName, setPmName] = useState('');
  const [smName, setSmName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setCode(projectToEdit.code);
      setName(projectToEdit.name);
      setClientName(projectToEdit.client_name);
      setClientContact(projectToEdit.client_contact || '');
      setContractNumber(projectToEdit.contract_number);
      setCategory(projectToEdit.category);
      setLocationAddress(projectToEdit.location_address);
      setLocationCity(projectToEdit.location_city);
      setLocationProvince(projectToEdit.location_province);
      setContractValueRaw(formatRupiah(projectToEdit.contract_value));
      setRealizedCostRaw(formatRupiah(projectToEdit.realized_cost));
      setStartDate(projectToEdit.start_date);
      setEndDate(projectToEdit.end_date);
      setMaintenanceDays(String(projectToEdit.maintenance_days));
      setRetentionPercent(String(projectToEdit.retention_percent));
      setPlannedProgress(String(projectToEdit.planned_progress));
      setActualProgress(String(projectToEdit.actual_progress));
      setStatus(projectToEdit.status);
      setPmName(projectToEdit.project_manager_name || '');
      setSmName(projectToEdit.site_manager_name || '');
      setNotes(projectToEdit.notes || '');
    } else {
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(100 + Math.random() * 900);
      setCode(`PRJ-${currentOrg?.company_code || 'IKN'}-${year}-${randomSeq}`);
      setName('');
      setClientName('');
      setClientContact('');
      setContractNumber('');
      setCategory('Gedung');
      setLocationAddress('');
      setLocationCity(currentOrg?.city || 'Jakarta Selatan');
      setLocationProvince('DKI Jakarta');
      setContractValueRaw('Rp 10.000.000.000');
      setRealizedCostRaw('Rp 0');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      const nextYear = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0];
      setEndDate(nextYear);
      setMaintenanceDays('180');
      setRetentionPercent('5');
      setPlannedProgress('0');
      setActualProgress('0');
      setStatus('active');
      setPmName('Hendra Gunawan, ST');
      setSmName('Rian Pratama, ST');
      setNotes('');
    }
    setError('');
  }, [projectToEdit, isOpen, currentOrg]);

  if (!isOpen) return null;

  const handleContractValueChange = (val: string) => {
    const num = parseRupiah(val);
    setContractValueRaw(formatRupiah(num));
  };

  const handleRealizedCostChange = (val: string) => {
    const num = parseRupiah(val);
    setRealizedCostRaw(formatRupiah(num));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama proyek wajib diisi');
      return;
    }
    if (!clientName.trim()) {
      setError('Nama klien/owner wajib diisi');
      return;
    }
    if (!startDate || !endDate) {
      setError('Tanggal mulai dan selesai wajib diisi');
      return;
    }

    const contractValueNum = parseRupiah(contractValueRaw);
    const realizedCostNum = parseRupiah(realizedCostRaw);

    setIsSubmitting(true);
    try {
      if (projectToEdit) {
        await handleUpdateProject(projectToEdit.id, {
          code,
          name: name.trim(),
          client_name: clientName.trim(),
          client_contact: clientContact.trim(),
          contract_number: contractNumber.trim() || `SPK-${code}`,
          category,
          location_address: locationAddress.trim(),
          location_city: locationCity.trim(),
          location_province: locationProvince.trim(),
          contract_value: contractValueNum,
          realized_cost: realizedCostNum,
          start_date: startDate,
          end_date: endDate,
          maintenance_days: parseInt(maintenanceDays, 10) || 180,
          retention_percent: parseFloat(retentionPercent) || 5,
          planned_progress: parseFloat(plannedProgress) || 0,
          actual_progress: parseFloat(actualProgress) || 0,
          status,
          project_manager_name: pmName,
          site_manager_name: smName,
          notes: notes.trim(),
        });
      } else {
        await handleCreateProject({
          organization_id: currentOrg?.id || 'org-indotek-001',
          code,
          name: name.trim(),
          client_name: clientName.trim(),
          client_contact: clientContact.trim(),
          contract_number: contractNumber.trim() || `SPK-${code}`,
          category,
          location_address: locationAddress.trim() || locationCity,
          location_city: locationCity.trim() || 'Jakarta',
          location_province: locationProvince.trim() || 'DKI Jakarta',
          contract_value: contractValueNum,
          realized_cost: realizedCostNum,
          start_date: startDate,
          end_date: endDate,
          maintenance_days: parseInt(maintenanceDays, 10) || 180,
          retention_percent: parseFloat(retentionPercent) || 5,
          planned_progress: parseFloat(plannedProgress) || 0,
          actual_progress: parseFloat(actualProgress) || 0,
          status,
          project_manager_name: pmName,
          site_manager_name: smName,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan proyek');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {projectToEdit ? 'Ubah Informasi Proyek' : 'Tambah Proyek Konstruksi Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Kontrak, Jadwal, Anggaran, dan Penanggung Jawab Lapangan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Section: Identitas Proyek */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Proyek <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Proyek Konstruksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pembangunan Menara Sentosa 18 Lantai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Klien & Kontrak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Klien / Pemberi Tugas (Owner) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT. Citra Mandiri / Dinas PUPR"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Kontrak / SPK
              </label>
              <input
                type="text"
                placeholder="Contoh: SPK/IKN/01/2026/088"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Pekerjaan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Gedung">Gedung / Struktur Bangunan</option>
                <option value="Infrastruktur">Infrastruktur & Jalan</option>
                <option value="Renovasi">Renovasi & Fit-out</option>
                <option value="MEP">Mekanikal, Elektrikal & Plumbing</option>
                <option value="Perumahan">Perumahan / Residensial</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="planning">Perencanaan (Planning)</option>
                <option value="active">Sedang Berjalan (Active)</option>
                <option value="delayed">Terlambat (Delayed)</option>
                <option value="completed">Selesai (Completed)</option>
                <option value="maintenance">Masa Pemeliharaan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Retensi (%)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={retentionPercent}
                onChange={(e) => setRetentionPercent(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Nilai Kontrak (Rupiah Input) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                Nilai Kontrak Total (Rupiah) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contractValueRaw}
                onChange={(e) => handleContractValueChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Termasuk PPN 11% & Overhead</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                Realisasi Biaya Saat Ini (Cost)
              </label>
              <input
                type="text"
                value={realizedCostRaw}
                onChange={(e) => handleRealizedCostChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Total pengeluaran riil material + upah + alat</p>
            </div>
          </div>

          {/* Section: Jadwal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai Proyek <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Selesai Kontrak <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Masa Pemeliharaan (Hari)
              </label>
              <input
                type="number"
                min="0"
                value={maintenanceDays}
                onChange={(e) => setMaintenanceDays(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Bobot Progres Fisik (%) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Progres Rencana (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={plannedProgress}
                onChange={(e) => setPlannedProgress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Realisasi Progres Fisik (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={actualProgress}
                onChange={(e) => setActualProgress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Lokasi & Tim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Lokasi Proyek
              </label>
              <input
                type="text"
                placeholder="Jl. Raya Utama KM 15, Kawasan Industri"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                placeholder="Contoh: Jakarta Selatan, Bekasi, Tangerang"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Manager (PM)
              </label>
              <input
                type="text"
                placeholder="Nama PM penanggung jawab"
                value={pmName}
                onChange={(e) => setPmName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Site Manager / Pelaksana Lapangan
              </label>
              <input
                type="text"
                placeholder="Nama Site Manager"
                value={smName}
                onChange={(e) => setSmName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Khusus / Ringkasan Lapangan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan mengenai progress, kendala pengadaan, atau target milestone terdekat..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              {isSubmitting ? 'Menyimpan...' : projectToEdit ? 'Simpan Perubahan' : 'Buat Proyek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

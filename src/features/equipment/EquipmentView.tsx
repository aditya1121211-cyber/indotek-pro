import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../utils/format';
import { EquipmentAsset } from '../../types/database';
import {
  Wrench,
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Fuel,
  Activity,
  MapPin,
  Calendar,
} from 'lucide-react';

export const EquipmentView: React.FC = () => {
  const { currentOrg, equipmentAssets, projects, selectedProjectId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = equipmentAssets.filter((eq) => {
    const matchSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.brand_model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = selectedProjectId === 'all' || eq.assigned_project_id === selectedProjectId;
    return matchSearch && matchProject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Peralatan & Aset Konstruksi
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul J
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manajemen alat berat, peralatan angkat, genset, monitoring jam operasi, konsumsi BBM, dan jadwal maintenance
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Unit Alat</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{equipmentAssets.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Asset terdaftar di sistem</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Kondisi Siap Operasi</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {equipmentAssets.filter((e) => e.condition === 'Sangat Baik' || e.condition === 'Baik').length} Unit
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">100% kelayakan laik operasi</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Aset Internal Perusahaan</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {equipmentAssets.filter((e) => e.ownership === 'Internal Asset').length} Unit
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Inventaris PT Indotek</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Sewa / Rental Luar</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {equipmentAssets.filter((e) => e.ownership === 'Sewa / Rental').length} Unit
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Kontrak sewa berkala</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kode unit, model alat, atau nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Grid of Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssets.map((eq) => (
          <div
            key={eq.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {eq.code}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {eq.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{eq.name}</h3>
                <p className="text-xs text-slate-400">{eq.brand_model}</p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                {eq.condition}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Status Kepemilikan:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{eq.ownership}</p>
              </div>
              <div>
                <span className="text-slate-400">Biaya / Sewa Harian:</span>
                <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatRupiah(eq.daily_rental_rate)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Lokasi Site: <strong>{eq.assigned_project_name || 'Gudang Pusat'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Total Jam Operasi: {eq.total_operating_hours} Jam</span>
              </div>
              {eq.fuel_consumption_rate && (
                <div className="flex items-center gap-2">
                  <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Konsumsi: {eq.fuel_consumption_rate}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-400">
              <span>Servis Terakhir: {formatDateIndo(eq.last_maintenance_date)}</span>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Servis Berikutnya: {formatDateIndo(eq.next_maintenance_date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../utils/format';
import { MaterialStockItem, StockMovement } from '../../types/database';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Package,
  Layers,
  MapPin,
  CheckCircle2,
  X,
} from 'lucide-react';

export const WarehouseView: React.FC = () => {
  const {
    currentOrg,
    materialStocks,
    stockMovements,
    projects,
    selectedProjectId,
    handleAddStockMovement,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stocks' | 'movements'>('stocks');
  const [isRecordMovementOpen, setIsRecordMovementOpen] = useState(false);

  // Movement Form State
  const [movementType, setMovementType] = useState<StockMovement['type']>('out');
  const [movementProjectId, setMovementProjectId] = useState(projects[0]?.id || '');
  const [movementItemName, setMovementItemName] = useState('');
  const [movementQty, setMovementQty] = useState(10);
  const [movementUnit, setMovementUnit] = useState('batang');
  const [movementRefDoc, setMovementRefDoc] = useState('REQ-SITE-099');
  const [movementRecipient, setMovementRecipient] = useState('Mandor Suparno');
  const [movementNotes, setMovementNotes] = useState('');

  const filteredStocks = materialStocks.filter((s) => {
    const matchSearch =
      s.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = selectedProjectId === 'all' || s.project_id === selectedProjectId;
    return matchSearch && matchProject;
  });

  const filteredMovements = stockMovements.filter((m) => {
    const matchSearch =
      m.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.movement_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = selectedProjectId === 'all' || m.project_id === selectedProjectId;
    return matchSearch && matchProject;
  });

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;

    await handleAddStockMovement({
      organization_id: currentOrg.id,
      project_id: movementProjectId,
      movement_number: `MUT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      movement_date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      item_name: movementItemName || 'Material Konstruksi',
      unit: movementUnit,
      type: movementType,
      quantity: Number(movementQty),
      reference_doc: movementRefDoc,
      recipient_or_supplier: movementRecipient,
      notes: movementNotes,
    });

    setIsRecordMovementOpen(false);
  };

  const lowStockCount = materialStocks.filter((s) => s.status === 'low' || s.status === 'out_of_stock').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Material & Gudang Proyek
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul F
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengendalian stok material di site, peringatan stok minimum, mutasi masuk/keluar, dan transfer antar proyek
          </p>
        </div>

        <button
          onClick={() => setIsRecordMovementOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Mutasi Material</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Material Terdata</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{materialStocks.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Item aktif di lokasi</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Peringatan Stok Rendah</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{lowStockCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Di bawah safety stock</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Mutasi Bulan Ini</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stockMovements.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Barang masuk & keluar</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Status Gudang Site</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Optimal</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sesuai standar operasional</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'stocks'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stok Material Per Proyek</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {filteredStocks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Log Riwayat Mutasi</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {filteredMovements.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kode material, nama bahan, atau lokasi rak..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Stock Cards / Grid */}
      {activeTab === 'stocks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => {
            const isLow = stock.current_stock <= stock.minimum_stock;
            const percentageOfSafety = Math.min(100, Math.round((stock.current_stock / stock.minimum_stock) * 100));

            return (
              <div
                key={stock.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xs"
              >
                {isLow && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>RESTOCK</span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {stock.category} • {stock.item_code}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                    {stock.item_name}
                  </h4>
                  <p className="text-xs text-slate-400">{stock.project_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Stok Saat Ini</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {stock.current_stock}{' '}
                      <span className="text-xs font-normal text-slate-500">{stock.unit}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Batas Minimum</span>
                    <p className="text-lg font-bold text-slate-500">
                      {stock.minimum_stock}{' '}
                      <span className="text-xs font-normal text-slate-500">{stock.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Safety stock visual progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Level Keamanan Stok</span>
                    <span className={isLow ? 'text-rose-500 font-bold' : 'text-emerald-500 font-semibold'}>
                      {percentageOfSafety}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLow ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentageOfSafety}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{stock.location_rack}</span>
                  </div>
                  <span>Nilai: {formatRupiah(stock.average_price)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Movement Log */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Mutasi & Waktu</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Item & Volume</th>
                  <th className="py-3 px-4">Referensi Dokumen</th>
                  <th className="py-3 px-4">Penerima / Supplier</th>
                  <th className="py-3 px-4">Catatan Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{m.movement_number}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.movement_date}</div>
                    </td>
                    <td className="py-3 px-4">
                      {m.type === 'in' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <ArrowDownRight className="w-3 h-3" /> Masuk
                        </span>
                      ) : m.type === 'out' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
                          <ArrowUpRight className="w-3 h-3" /> Keluar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
                          <ArrowRightLeft className="w-3 h-3" /> Transfer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{m.item_name}</span>
                      <span className="block text-xs text-slate-500 font-semibold mt-0.5">
                        {m.quantity} {m.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {m.reference_doc}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {m.recipient_or_supplier}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 italic max-w-xs truncate">
                      {m.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Movement Modal */}
      {isRecordMovementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Catat Mutasi Material Lapangan</h3>
              <button onClick={() => setIsRecordMovementOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Mutasi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('out')}
                    className={`py-2 rounded-xl font-bold transition text-center ${
                      movementType === 'out'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Keluar ke Lapangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('in')}
                    className={`py-2 rounded-xl font-bold transition text-center ${
                      movementType === 'in'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Masuk Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('transfer_out')}
                    className={`py-2 rounded-xl font-bold transition text-center ${
                      movementType === 'transfer_out'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Transfer Proyek
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Proyek Terkait</label>
                <select
                  value={movementProjectId}
                  onChange={(e) => setMovementProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Material</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Besi Beton D16 atau Kawat Bendrat"
                  value={movementItemName}
                  onChange={(e) => setMovementItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah Volume</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={(e) => setMovementQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={movementUnit}
                    onChange={(e) => setMovementUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Penerima / Mandor / Subkon
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama mandor atau pihak penerima"
                  value={movementRecipient}
                  onChange={(e) => setMovementRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Tujuan pemakaian (contoh: Pengecoran Plat Lantai 8)"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordMovementOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

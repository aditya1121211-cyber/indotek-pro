import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../utils/format';
import { PurchaseOrder, Vendor, GoodsReceiptNote } from '../../types/database';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Truck,
  Building,
  Phone,
  Mail,
  Star,
  Check,
  X,
  Eye,
  FileCheck,
} from 'lucide-react';

export const ProcurementView: React.FC = () => {
  const {
    currentOrg,
    purchaseOrders,
    vendors,
    purchaseRequests,
    goodsReceipts,
    projects,
    selectedProjectId,
    handleCreatePO,
    handleUpdatePOStatus,
    currentRole,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'po' | 'pr' | 'vendors' | 'grn'>('po');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPOForDetail, setSelectedPOForDetail] = useState<PurchaseOrder | null>(null);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);

  // New PO form state
  const [newPOProjectId, setNewPOProjectId] = useState(projects[0]?.id || '');
  const [newPOVendorId, setNewPOVendorId] = useState(vendors[0]?.id || '');
  const [newPODeadline, setNewPODeadline] = useState('2026-10-30');
  const [newPOItemName, setNewPOItemName] = useState('');
  const [newPOItemSpec, setNewPOItemSpec] = useState('');
  const [newPOItemUnit, setNewPOItemUnit] = useState('m3');
  const [newPOItemQty, setNewPOItemQty] = useState(50);
  const [newPOItemPrice, setNewPOItemPrice] = useState(1150000);

  // Filtered POs
  const filteredPOs = purchaseOrders.filter((po) => {
    const matchSearch =
      po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || po.status === statusFilter;
    const matchProject = selectedProjectId === 'all' || po.project_id === selectedProjectId;
    return matchSearch && matchStatus && matchProject;
  });

  const handleSavePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    const selectedProj = projects.find((p) => p.id === newPOProjectId) || projects[0];
    const selectedVnd = vendors.find((v) => v.id === newPOVendorId) || vendors[0];

    const subtotal = newPOItemQty * newPOItemPrice;
    const ppn = subtotal * 0.11;
    const grandTotal = subtotal + ppn;

    const poNumber = `PO/${currentOrg.company_code}/2026/10/${Math.floor(1000 + Math.random() * 9000)}`;

    await handleCreatePO({
      organization_id: currentOrg.id,
      project_id: selectedProj.id,
      project_name: selectedProj.name,
      po_number: poNumber,
      vendor_id: selectedVnd.id,
      vendor_name: selectedVnd.name,
      vendor_contact: `${selectedVnd.contact_person} (${selectedVnd.phone})`,
      order_date: new Date().toISOString().split('T')[0],
      delivery_deadline: newPODeadline,
      delivery_address: `Site Proyek ${selectedProj.name}, ${selectedProj.location_city}`,
      subtotal,
      ppn_percent: 11,
      ppn_amount: ppn,
      grand_total: grandTotal,
      status: grandTotal > 100000000 ? 'pending_approval' : 'approved',
      approved_by_name: grandTotal <= 100000000 ? 'Project Manager' : undefined,
      items: [
        {
          id: `poi-${Date.now()}`,
          item_code: 'BHN-CUSTOM',
          item_name: newPOItemName || 'Material Konstruksi',
          specification: newPOItemSpec || 'Standar Proyek',
          unit: newPOItemUnit,
          quantity: Number(newPOItemQty),
          unit_price: Number(newPOItemPrice),
          total_price: subtotal,
          received_quantity: 0,
        },
      ],
    });

    setIsCreatePOModalOpen(false);
    setNewPOItemName('');
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Disetujui
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Menunggu Approval
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            <Truck className="w-3 h-3" /> Barang Diterima
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
            <X className="w-3 h-3" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {status}
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
              Pengadaan & Procurement
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul E
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manajemen alur pengadaan: Purchase Request (PR) &gt; Purchase Order (PO) &gt; Surat Jalan & Penerimaan Barang (GRN)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatePOModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Buat PO Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Purchase Orders</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{purchaseOrders.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua proyek aktif</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Menunggu Approval</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {purchaseOrders.filter((p) => p.status === 'pending_approval').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Memerlukan persetujuan Direksi/PM</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">PO Disetujui & Dipesan</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {purchaseOrders.filter((p) => p.status === 'approved' || p.status === 'received').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Siap / sedang dikirim supplier</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Master Rekanan / Vendor</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{vendors.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Supplier terverifikasi</p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveSubTab('po')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'po'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Purchase Orders (PO)</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {filteredPOs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('pr')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'pr'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase Requests (PR)</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {purchaseRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('grn')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'grn'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Penerimaan Barang (GRN)</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {goodsReceipts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('vendors')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'vendors'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Master Vendor & Supplier</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {vendors.length}
          </span>
        </button>
      </div>

      {/* Tab: Purchase Orders */}
      {activeSubTab === 'po' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor PO, vendor, atau proyek..."
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
                <option value="pending_approval">Menunggu Approval</option>
                <option value="approved">Disetujui</option>
                <option value="received">Barang Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          {/* PO Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. PO & Tanggal</th>
                    <th className="py-3 px-4">Proyek</th>
                    <th className="py-3 px-4">Vendor / Supplier</th>
                    <th className="py-3 px-4 text-right">Nilai Total (Termasuk PPN)</th>
                    <th className="py-3 px-4">Tenggat Kirim</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPOs.map((po) => (
                    <tr
                      key={po.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{po.po_number}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatDateIndo(po.order_date)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                        {po.project_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {po.vendor_name}
                        </div>
                        <div className="text-[11px] text-slate-400">{po.vendor_contact}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {formatRupiah(po.grand_total)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Subtotal: {formatRupiah(po.subtotal)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {formatDateIndo(po.delivery_deadline)}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(po.status)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPOForDetail(po)}
                            title="Lihat / Cetak PO"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {po.status === 'pending_approval' && (currentRole === 'owner' || currentRole === 'project_manager') && (
                            <button
                              onClick={() => handleUpdatePOStatus(po.id, 'approved', 'Direktur / PM')}
                              title="Setujui PO"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Purchase Requests */}
      {activeSubTab === 'pr' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Daftar Permintaan Pengadaan Lapangan (PR)
            </h3>
            <span className="text-xs text-slate-400">Diusulkan oleh Tim Site Engineer & Pelaksana</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {purchaseRequests.map((pr) => (
              <div key={pr.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{pr.pr_number}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        pr.urgency === 'urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {pr.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {pr.project_name} • Diajukan oleh: {pr.requester_name} ({pr.department})
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Item: {pr.items.map((i) => `${i.item_name} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                    {formatRupiah(pr.total_estimated_amount)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Dibutuhkan: {formatDateIndo(pr.required_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Penerimaan Barang (GRN) */}
      {activeSubTab === 'grn' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Surat Jalan & Bukti Penerimaan Barang (Goods Receipt Note)
            </h3>
            <span className="text-xs text-slate-400">Pencocokan 3-Arah (PO vs Surat Jalan vs Fisik)</span>
          </div>

          <div className="space-y-3">
            {goodsReceipts.map((grn) => (
              <div
                key={grn.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {grn.grn_number}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        SJ: {grn.delivery_note_number}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Ref PO: <span className="font-medium text-slate-700 dark:text-slate-300">{grn.po_number}</span> • Vendor: {grn.vendor_name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Diterima pada:</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatDateIndo(grn.received_date)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Penerima Site:</span>{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{grn.receiver_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Kendaraan & Sopir:</span>{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {grn.vehicle_number} ({grn.driver_name})
                    </span>
                  </div>
                </div>

                {grn.notes && (
                  <div className="mt-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 p-2 rounded-lg">
                    Catatan QC Lapangan: {grn.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Master Vendor */}
      {activeSubTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {v.category}
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{v.name}</h4>
                  <p className="text-xs text-slate-400">{v.code}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{v.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{v.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{v.contact_person} • {v.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{v.email}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                <span>Termin Bayar: {v.payment_terms_days} Hari</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{v.bank_name} {v.bank_account_no}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail PO / Cetak PDF Modal */}
      {selectedPOForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  IKN
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {currentOrg?.name || 'PT. INDOTEK KARYA NUSANTARA'}
                  </h3>
                  <p className="text-xs text-slate-400">Surat Pesanan / Purchase Order Resmi</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPOForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PO Details Sheet */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div>
                  <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Nomor Pesanan</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{selectedPOForDetail.po_number}</p>
                  <p className="text-slate-500 mt-1">Tanggal: {formatDateIndo(selectedPOForDetail.order_date)}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Supplier / Rekanan</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{selectedPOForDetail.vendor_name}</p>
                  <p className="text-slate-500 mt-1">{selectedPOForDetail.vendor_contact}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">Tujuan Pengiriman</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">{selectedPOForDetail.delivery_address}</p>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Item & Spesifikasi</th>
                      <th className="p-2.5 text-center">Vol</th>
                      <th className="p-2.5 text-center">Satuan</th>
                      <th className="p-2.5 text-right">Harga Satuan</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedPOForDetail.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900 dark:text-white">{item.item_name}</p>
                          <p className="text-[11px] text-slate-400">{item.specification}</p>
                        </td>
                        <td className="p-2.5 text-center font-medium">{item.quantity}</td>
                        <td className="p-2.5 text-center text-slate-500">{item.unit}</td>
                        <td className="p-2.5 text-right">{formatRupiah(item.unit_price)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {formatRupiah(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-950 font-bold">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right">Subtotal Langsung:</td>
                      <td className="p-2.5 text-right">{formatRupiah(selectedPOForDetail.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right">PPN 11%:</td>
                      <td className="p-2.5 text-right">{formatRupiah(selectedPOForDetail.ppn_amount)}</td>
                    </tr>
                    <tr className="text-amber-600 dark:text-amber-400 text-sm border-t border-slate-200 dark:border-slate-800">
                      <td colSpan={4} className="p-2.5 text-right">TOTAL PO:</td>
                      <td className="p-2.5 text-right">{formatRupiah(selectedPOForDetail.grand_total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedPOForDetail.approved_by_name && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Telah disetujui secara digital oleh: <strong>{selectedPOForDetail.approved_by_name}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button
                onClick={() => setSelectedPOForDetail(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buat PO Baru Modal */}
      {isCreatePOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Buat Purchase Order (PO) Baru</h3>
              <button onClick={() => setIsCreatePOModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Proyek Konstruksi
                </label>
                <select
                  value={newPOProjectId}
                  onChange={(e) => setNewPOProjectId(e.target.value)}
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
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Vendor / Supplier
                </label>
                <select
                  value={newPOVendorId}
                  onChange={(e) => setNewPOVendorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Item / Material
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Semen Portland Composite atau Besi Beton D16"
                  value={newPOItemName}
                  onChange={(e) => setNewPOItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Volume</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPOItemQty}
                    onChange={(e) => setNewPOItemQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={newPOItemUnit}
                    onChange={(e) => setNewPOItemUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPOItemPrice}
                    onChange={(e) => setNewPOItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tenggat Pengiriman
                </label>
                <input
                  type="date"
                  required
                  value={newPODeadline}
                  onChange={(e) => setNewPODeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Perkiraan Total + PPN 11%:</span>
                <span>{formatRupiah((newPOItemQty * newPOItemPrice) * 1.11)}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePOModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition"
                >
                  Simpan & Terbitkan PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

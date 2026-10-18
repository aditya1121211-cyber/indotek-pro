import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../utils/format';
import { ProjectDocument } from '../../types/database';
import {
  FolderOpen,
  FileText,
  FileCode,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { documents, projects, selectedProjectId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<ProjectDocument | null>(null);

  const categories = [
    'all',
    'Gambar Kerja (DED)',
    'Shop Drawing',
    'Kontrak & SPK',
    'RFI (Klarifikasi)',
    'As-Built Drawing',
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchProject = selectedProjectId === 'all' || doc.project_id === selectedProjectId;
    return matchSearch && matchCat && matchProject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dokumen & Gambar Kerja
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Modul L
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Repositori terpusat gambar kerja (DED), Shop Drawing, As-Built, Kontrak SPK, RFI & Berita Acara Proyek
          </p>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Semua Dokumen' : cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama gambar, nomor DED..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 relative group hover:border-amber-500/50 transition shadow-xs"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {doc.version_rev}
                  </span>
                  <p className="text-[11px] font-medium text-slate-400">{doc.document_number}</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  doc.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {doc.status === 'approved' ? 'Disetujui Konsultan' : 'Review'}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                {doc.title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{doc.project_name}</p>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>File:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                  {doc.file_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ukuran:</span>
                <span>{doc.file_size_mb} MB</span>
              </div>
              {doc.approved_by && (
                <div className="flex justify-between">
                  <span>Disetujui:</span>
                  <span className="truncate max-w-[150px]">{doc.approved_by}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400">{formatDateIndo(doc.upload_date)}</span>
              <button
                onClick={() => setPreviewDoc(doc)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Preview</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-500">{previewDoc.document_number} • {previewDoc.version_rev}</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{previewDoc.title}</h3>
                <p className="text-xs text-slate-400">{previewDoc.project_name}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Blueprint Mock Preview */}
            <div className="h-72 bg-slate-950 rounded-xl border border-slate-800 relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:16px_16px]" />
              <FileCode className="w-12 h-12 text-cyan-400 mb-2 z-10" />
              <p className="font-mono text-cyan-300 text-sm font-bold z-10">{previewDoc.file_name}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md z-10">
                Gambar DED Teknik Resmi PT Indotek Karya Nusantara. Skala 1:100.
                Telah melalui proses Review Engineering & Approval Konsultan Pengawas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-400">Pengunggah Dokumen:</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{previewDoc.uploaded_by}</p>
              </div>
              <div>
                <p className="text-slate-400">Persetujuan Resmi:</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {previewDoc.approved_by || 'Dalam Proses Review'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

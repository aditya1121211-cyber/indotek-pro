import React, { useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import {
  getSavedCredentials,
  saveCredentials,
  clearCustomCredentials,
  isSupabaseConfigured,
} from '../../lib/supabase';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Trash2,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const SupabaseConnectionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isSupabaseLive, refreshConnectionStatus, reloadAllData, setActiveTab } = useApp();
  const credentials = getSavedCredentials();

  const [url, setUrl] = useState(credentials.url);
  const [anonKey, setAnonKey] = useState(credentials.anonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setErrorMsg('');
    setConnectionStatus('');
    if (!url.trim() || !anonKey.trim()) {
      setErrorMsg('Harap masukkan Supabase Project URL dan Anon Key.');
      return;
    }
    if (!url.includes('supabase.co')) {
      setErrorMsg('URL harus berupa format https://[project-id].supabase.co');
      return;
    }

    saveCredentials(url, anonKey);
    refreshConnectionStatus();
    const client = getSupabase();
    if (!client) {
      setErrorMsg('Konfigurasi Supabase tidak valid.');
      return;
    }
    const { error } = await client.from('organizations').select('id').limit(1);
    if (error) {
      setErrorMsg(`Koneksi gagal: ${error.message}`);
      setConnectionStatus('');
      return;
    }
    setConnectionStatus('Supabase API merespons. Hasil kosong dapat terjadi karena RLS atau belum ada organisasi.');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      reloadAllData();
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setConnectionStatus('');
    clearCustomCredentials();
    setUrl('');
    setAnonKey('');
    refreshConnectionStatus();
    reloadAllData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isSupabaseLive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Koneksi Backend Supabase
              </h2>
              <p className="text-xs text-slate-500">
                PostgreSQL, RLS, Storage & Realtime
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

        {/* Status Indicator */}
        <div className="p-6 space-y-4">
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              isSupabaseLive
                ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            {isSupabaseLive ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            )}
            <div className="text-xs">
              <p className="font-semibold">
                {isSupabaseLive
                  ? 'Supabase terkonfigurasi'
                  : 'Mode Demo Lokal Aktif (Offline-Ready)'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isSupabaseLive
                  ? 'Kredensial tersedia. Simpan & Hubungkan untuk menguji respons Supabase; data organisasi tetap dibatasi sesi dan RLS.'
                  : 'Aplikasi berjalan lancar dengan penyimpanan lokal otomatis. Masukkan kredensial Supabase untuk integrasi cloud.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Anon / Public API Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Gunakan `anon public key`, <strong>JANGAN PERNAH</strong> memasukkan `service_role key` di browser frontend.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMsg}
              </p>
            )}

            {connectionStatus && (
              <p role="status" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {connectionStatus}
              </p>
            )}

            {saveSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Koneksi berhasil diperbarui!
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onClose();
                setActiveTab('guide');
              }}
              className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Lihat Panduan Setup SQL
            </button>

            <div className="flex items-center gap-2">
              {credentials.isCustom && (
                <button
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition"
              >
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

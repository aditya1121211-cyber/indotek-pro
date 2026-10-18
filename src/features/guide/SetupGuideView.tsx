import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Database,
  Cloud,
  ShieldCheck,
  Code2,
  Terminal,
  FileCheck,
} from 'lucide-react';

const SQL_MIGRATION_TEXT = `-- ==============================================================================
-- INDOTEK PRO - SKEMA DATABASE MULTI-TENANT & ROW LEVEL SECURITY (RLS)
-- FASE 1: Fondasi Organisasi, Pengguna, Proyek, Audit Log, Notifikasi & Langganan
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM (
    'owner', 'admin', 'project_manager', 'site_manager',
    'estimator', 'procurement', 'finance', 'warehouse',
    'safety_officer', 'subcontractor', 'client_viewer'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status_type AS ENUM (
    'planning', 'active', 'delayed', 'completed', 'maintenance'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ
);

-- 2. ORGANIZATIONS (Tenant Kontraktor)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  company_code TEXT NOT NULL DEFAULT 'IND',
  logo_url TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  npwp TEXT,
  nib TEXT,
  letterhead_url TEXT,
  bank_name TEXT,
  bank_account_no TEXT,
  bank_account_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'WIB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ
);

-- 3. ORGANIZATION_MEMBERS
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'site_manager',
  department TEXT,
  job_title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(organization_id, user_id)
);

-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT,
  contract_number TEXT,
  category TEXT NOT NULL DEFAULT 'Gedung',
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_province TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  contract_value NUMERIC NOT NULL DEFAULT 0,
  realized_cost NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  maintenance_days INT NOT NULL DEFAULT 180,
  retention_percent NUMERIC NOT NULL DEFAULT 5.0,
  planned_progress NUMERIC NOT NULL DEFAULT 0,
  actual_progress NUMERIC NOT NULL DEFAULT 0,
  status project_status_type NOT NULL DEFAULT 'active',
  project_manager_id UUID REFERENCES public.profiles(id),
  site_manager_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, code)
);

-- 5. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = target_org_id AND user_id = auth.uid() AND is_active = true
  );
$$;

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
`;

export const SetupGuideView: React.FC<{
  onOpenSupabaseModal: () => void;
}> = ({ onOpenSupabaseModal }) => {
  const [copied, setCopied] = useState(false);

  const copySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Panduan Setup Supabase & Deploy Vercel
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Petunjuk langkah demi langkah menghubungkan backend database PostgreSQL Supabase dan publikasi ke Vercel
        </p>
      </div>

      {/* Step 1 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Buat Project Baru di Supabase
            </h3>
            <p className="text-xs text-slate-500">PostgreSQL Cloud Gratis & Cepat</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Buka{' '}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-amber-500 font-bold hover:underline inline-flex items-center gap-1"
          >
            supabase.com <ExternalLink className="w-3 h-3" />
          </a>
          , login, lalu buat project baru dengan nama <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">indotek-pro</code> dan pilih Region terdekat (misalnya <strong>Singapore - ap-southeast-1</strong>).
        </p>
      </div>

      {/* Step 2 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Jalankan Skrip SQL Migration & RLS
              </h3>
              <p className="text-xs text-slate-500">Multi-tenant, Helper Functions & Row Level Security</p>
            </div>
          </div>
          <button
            onClick={copySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Copy SQL Lengkap'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Di Dashboard Supabase Anda, buka menu <strong>SQL Editor</strong> di bilah navigasi kiri, buat <em>New Query</em>, paste skrip di bawah ini, lalu klik tombol <strong>Run</strong>:
        </p>

        {/* Code Snippet Box */}
        <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-amber-300 max-h-64 overflow-y-auto leading-relaxed">
          <pre>{SQL_MIGRATION_TEXT}</pre>
        </div>
      </div>

      {/* Step 3 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
            3
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Salin URL & API Key ke Aplikasi
            </h3>
            <p className="text-xs text-slate-500">Project Settings → API</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Buka <strong>Project Settings</strong> → <strong>API</strong>. Salin <strong>Project URL</strong> dan <strong>Project API Keys (anon / public)</strong>.
        </p>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Ingin langsung menguji koneksi tanpa build ulang?
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Anda bisa memasukkan kredensial langsung melalui dialog koneksi di pojok kanan atas.
            </p>
          </div>
          <button
            onClick={onOpenSupabaseModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm whitespace-nowrap"
          >
            Buka Form Koneksi
          </button>
        </div>
      </div>

      {/* Step 4 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
            4
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Deploy ke Vercel dengan SPA Rewrite
            </h3>
            <p className="text-xs text-slate-500">Produksi Siap Akses</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          File <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">vercel.json</code> sudah tersedia di root proyek dengan konfigurasi rewrite single-page app (SPA). Masukkan dua environment variable berikut di <strong>Vercel Project Settings → Environment Variables</strong>:
        </p>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-emerald-400 space-y-1">
          <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=your-supabase-anon-key</p>
        </div>
      </div>
    </div>
  );
};

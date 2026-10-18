-- ==============================================================================
-- INDOTEK PRO - SKEMA DATABASE MULTI-TENANT & ROW LEVEL SECURITY (RLS)
-- FASE 1: Fondasi Organisasi, Pengguna, Proyek, Audit Log, Notifikasi & Langganan
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPE ENUM
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM (
    'owner',
    'admin',
    'project_manager',
    'site_manager',
    'estimator',
    'procurement',
    'finance',
    'warehouse',
    'safety_officer',
    'subcontractor',
    'client_viewer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status_type AS ENUM (
    'planning',
    'active',
    'delayed',
    'completed',
    'maintenance'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status_type AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL UTAMA: PROFILES (Terhubung ke auth.users)
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

-- 4. TABEL ORGANIZATIONS (Tenant / Perusahaan Kontraktor)
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

-- 5. TABEL ORGANIZATION_MEMBERS (Relasi User <-> Organisasi dengan Role)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'site_manager',
  department TEXT,
  job_title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(organization_id, user_id)
);

-- 6. TABEL PLANS & SUBSCRIPTIONS (Struktur Skalabilitas SaaS Multi-tenant)
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_idr NUMERIC NOT NULL,
  max_projects INT NOT NULL DEFAULT 5,
  max_members INT NOT NULL DEFAULT 10,
  max_storage_gb INT NOT NULL DEFAULT 5,
  features JSONB NOT NULL DEFAULT '{"rab": true, "field_reports": true, "pwa": true}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status subscription_status_type NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABEL PROJECTS (Manajemen Proyek Konstruksi)
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

-- 8. TABEL PROJECT_ADDENDUMS (Variation Orders / Amandemen Kontrak)
CREATE TABLE IF NOT EXISTS public.project_addendums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  addendum_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  time_extension_days INT NOT NULL DEFAULT 0,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABEL AUDIT_LOGS (Pencatatan Aktivitas Penting untuk Kepatuhan Kontrak)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g. 'CREATE_PROJECT', 'UPDATE_RAB', 'APPROVE_PO'
  entity_type TEXT NOT NULL, -- 'project', 'addendum', 'member', 'setting'
  entity_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABEL NOTIFICATIONS (Pusat Notifikasi & Realtime)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'urgent', 'success'
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 11. INDEXES UNTUK PERFORMA QUERY CEPAT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON public.audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- ==============================================================================
-- 12. HELPER FUNCTIONS UNTUK ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Helper: Cek apakah user adalah member dari organization tertentu
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
      AND is_active = true
  );
$$;

-- Helper: Ambil role user saat ini di dalam organization
CREATE OR REPLACE FUNCTION public.current_user_role(target_org_id UUID)
RETURNS user_role_type
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = target_org_id
    AND user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;

-- Helper: Cek apakah user memiliki role tertentu (misal: 'owner', 'admin', 'project_manager')
CREATE OR REPLACE FUNCTION public.has_role(target_org_id UUID, allowed_roles user_role_type[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
      AND is_active = true
      AND role = ANY(allowed_roles)
  );
$$;

-- ==============================================================================
-- 13. AKTIFKAN ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_addendums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 14. POLICIES

-- PROFILES:
-- User dapat melihat profil mereka sendiri dan profil member dalam organisasi yang sama
CREATE POLICY "Profiles viewable by self and org peers"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM public.organization_members om1
    JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
    WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.id
  )
);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS:
-- Hanya member dari organisasi tersebut yang dapat melihat datanya
CREATE POLICY "Organizations viewable by active members"
ON public.organizations FOR SELECT
USING (public.is_org_member(id) AND deleted_at IS NULL);

-- Owner dan Admin yang dapat mengupdate info perusahaan
CREATE POLICY "Organizations updatable by owner or admin"
ON public.organizations FOR UPDATE
USING (public.has_role(id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]))
WITH CHECK (public.has_role(id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]));

-- Pembuatan organisasi diperbolehkan untuk user terotentikasi
CREATE POLICY "Authenticated users can create organization"
ON public.organizations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ORGANIZATION_MEMBERS:
CREATE POLICY "Members viewable by org peers"
ON public.organization_members FOR SELECT
USING (public.is_org_member(organization_id));

CREATE POLICY "Members manageable by owner and admin"
ON public.organization_members FOR ALL
USING (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]))
WITH CHECK (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]));

-- PROJECTS:
CREATE POLICY "Projects viewable by org members"
ON public.projects FOR SELECT
USING (public.is_org_member(organization_id) AND deleted_at IS NULL);

CREATE POLICY "Projects insertable by manager, admin, owner"
ON public.projects FOR INSERT
WITH CHECK (
  public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type])
);

CREATE POLICY "Projects updatable by manager, site manager, admin, owner"
ON public.projects FOR UPDATE
USING (
  public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type])
)
WITH CHECK (
  public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type])
);

CREATE POLICY "Projects soft-deletable by admin, owner"
ON public.projects FOR DELETE
USING (
  public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type])
);

-- AUDIT LOGS:
CREATE POLICY "Audit logs viewable by org members with privilege"
ON public.audit_logs FOR SELECT
USING (
  public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'finance'::user_role_type])
);

CREATE POLICY "Audit logs insertable by authenticated org members"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_org_member(organization_id));

-- NOTIFICATIONS:
CREATE POLICY "Users can view and manage their own notifications"
ON public.notifications FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- PLANS: Public read
CREATE POLICY "Plans readable by authenticated users"
ON public.plans FOR SELECT
USING (true);

-- ==============================================================================
-- 15. SEED DATA DEFAULT (PT. Indotek Karya Nusantara & Proyek Sampel)
-- ==============================================================================

-- Seed Plan
INSERT INTO public.plans (id, name, description, price_idr, max_projects, max_members, max_storage_gb)
VALUES
  ('starter', 'Kontraktor Mandiri', 'Untuk kontraktor perorangan atau tim kecil', 499000, 3, 5, 5),
  ('pro', 'Kontraktor Profesional', 'Paket standar untuk kontraktor menengah & proyek aktif', 1499000, 15, 25, 50),
  ('enterprise', 'Korporasi Konstruksi', 'Fitur penuh multi-proyek tak terbatas & multi-cabang', 4990000, 999, 999, 500)
ON CONFLICT (id) DO NOTHING;

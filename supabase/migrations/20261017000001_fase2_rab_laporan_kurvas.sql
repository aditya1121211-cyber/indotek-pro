-- ==============================================================================
-- INDOTEK PRO - FASE 2: RAB, BOQ & AHSP, PROGRES/KURVA S, LAPORAN HARIAN
-- ==============================================================================

-- 1. MASTER HARGA SATUAN (Bahan, Upah, Alat)
CREATE TABLE IF NOT EXISTS public.ahsp_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bahan', 'upah', 'alat')),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- e.g. 'm3', 'kg', 'OH', 'jam', 'lembar'
  unit_price NUMERIC NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'Standar Jurnal / PUPR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(organization_id, code)
);

-- 2. TEMPLATE ANALISA HARGA SATUAN PEKERJAAN (AHSP SNI)
CREATE TABLE IF NOT EXISTS public.ahsp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g. 'A.4.1.1.5'
  title TEXT NOT NULL, -- e.g. '1 m3 Cor Beton Mutu fc 25 MPa (K-300)'
  unit TEXT NOT NULL, -- e.g. 'm3'
  division TEXT NOT NULL, -- e.g. 'Struktur'
  overhead_percent NUMERIC NOT NULL DEFAULT 10,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  components JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ resource_code, name, category, coef, unit_price, subtotal }]
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BILL OF QUANTITIES (BOQ / RAB PROYEK)
CREATE TABLE IF NOT EXISTS public.project_boqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT 'RAB Pelaksanaan Awal (Rev 0)',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  overhead_percent NUMERIC NOT NULL DEFAULT 10.0,
  ppn_percent NUMERIC NOT NULL DEFAULT 11.0,
  subtotal_direct_cost NUMERIC NOT NULL DEFAULT 0,
  overhead_amount NUMERIC NOT NULL DEFAULT 0,
  ppn_amount NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(project_id, version_number)
);

-- 4. BOQ ITEMS HIERARKI PER DIVISI
CREATE TABLE IF NOT EXISTS public.project_boq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  boq_id UUID NOT NULL REFERENCES public.project_boqs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  division_code TEXT NOT NULL, -- e.g. 'DIV-1', 'DIV-2'
  division_name TEXT NOT NULL, -- e.g. 'Pekerjaan Struktur Bawah'
  item_code TEXT NOT NULL, -- e.g. '2.1'
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  volume NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  weight_percent NUMERIC NOT NULL DEFAULT 0,
  installed_volume NUMERIC NOT NULL DEFAULT 0,
  installed_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. LAPORAN HARIAN LAPANGAN (DAILY SITE REPORT)
CREATE TABLE IF NOT EXISTS public.daily_site_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  report_number TEXT NOT NULL, -- e.g. 'LH/IKN/2026/10/17'
  report_date DATE NOT NULL,
  weather_morning TEXT NOT NULL DEFAULT 'Cerah', -- 'Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Lebat'
  weather_afternoon TEXT NOT NULL DEFAULT 'Cerah',
  weather_evening TEXT NOT NULL DEFAULT 'Berawan',
  work_description TEXT NOT NULL,
  obstacles TEXT,
  solutions TEXT,
  site_manager_name TEXT NOT NULL,
  inspector_name TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  signature_site_manager TEXT, -- base64 digital signature
  signature_inspector TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(project_id, report_date)
);

-- 6. TENAGA KERJA HARIAN (MANPOWER)
CREATE TABLE IF NOT EXISTS public.daily_report_manpower (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_site_reports(id) ON DELETE CASCADE,
  trade_type TEXT NOT NULL, -- 'Mandor', 'Tukang Besi', 'Tukang Batu', 'Tukang Kayu', 'Pekerja/Kenek', 'Operator', 'K3'
  headcount INT NOT NULL DEFAULT 1,
  work_hours INT NOT NULL DEFAULT 8
);

-- 7. ALAT KERJA HARIAN (EQUIPMENT)
CREATE TABLE IF NOT EXISTS public.daily_report_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_site_reports(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  active_hours NUMERIC NOT NULL DEFAULT 8,
  standby_hours NUMERIC NOT NULL DEFAULT 0,
  remarks TEXT
);

-- 8. MATERIAL MASUK HARIAN
CREATE TABLE IF NOT EXISTS public.daily_report_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_site_reports(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  volume NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  supplier_name TEXT,
  delivery_note_no TEXT -- Nomor Surat Jalan
);

-- 9. FOTO DOKUMENTASI LAPANGAN
CREATE TABLE IF NOT EXISTS public.daily_report_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_site_reports(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  zone_location TEXT, -- e.g. 'Lantai 12 Zona B'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. KURVA S MINGGUAN (S-CURVE PROGRESS TRACKING)
CREATE TABLE IF NOT EXISTS public.weekly_progress_curves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  week_label TEXT NOT NULL, -- e.g. 'Minggu 12 (10-16 Okt)'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  planned_weekly_percent NUMERIC NOT NULL DEFAULT 0,
  planned_cumulative_percent NUMERIC NOT NULL DEFAULT 0,
  actual_weekly_percent NUMERIC,
  actual_cumulative_percent NUMERIC,
  deviation_percent NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(project_id, week_number)
);

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_boq_items_boq ON public.project_boq_items(boq_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_proj ON public.daily_site_reports(project_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_curves_proj ON public.weekly_progress_curves(project_id, week_number ASC);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ahsp_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ahsp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_site_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_manpower ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_progress_curves ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "AHSP readable by org members" ON public.ahsp_resources FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "AHSP templates readable by org members" ON public.ahsp_templates FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "BOQ readable by org members" ON public.project_boqs FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "BOQ items readable by org members" ON public.project_boq_items FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Daily reports readable by org members" ON public.daily_site_reports FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Weekly curves readable by org members" ON public.weekly_progress_curves FOR SELECT USING (public.is_org_member(organization_id));

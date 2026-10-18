-- ==============================================================================
-- INDOTEK PRO — SEED DATA DASAR
-- ==============================================================================

INSERT INTO public.plans (id, name, description, price_idr, max_projects, max_members, max_storage_gb, features, is_active)
VALUES
  ('starter', 'Kontraktor Mandiri', 'Untuk kontraktor perorangan atau tim kecil', 499000, 3, 5, 5, '{"rab": true, "field_reports": true, "pwa": true}', true),
  ('pro', 'Kontraktor Profesional', 'Paket standar untuk kontraktor menengah & proyek aktif', 1499000, 15, 25, 50, '{"rab": true, "field_reports": true, "pwa": true, "analytics": true}', true),
  ('enterprise', 'Korporasi Konstruksi', 'Fitur penuh multi-proyek tak terbatas & multi-cabang', 4990000, 999, 999, 500, '{"rab": true, "field_reports": true, "pwa": true, "analytics": true, "multi_org": true}', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.organizations (
  id,
  name,
  slug,
  company_code,
  address,
  city,
  province,
  postal_code,
  phone,
  email,
  npwp,
  nib,
  timezone
)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'PT Indotek Karya Nusantara',
  'pt-indotek-karya-nusantara',
  'IND',
  'Jl. Raya Serpong No. 88',
  'Tangerang Selatan',
  'Banten',
  '15310',
  '021-5551234',
  'hello@indotek.id',
  '01.234.567.8-901.000',
  '9123456789012345',
  'WIB'
)
ON CONFLICT (slug) DO NOTHING;

WITH org AS (
  SELECT id
  FROM public.organizations
  WHERE slug = 'pt-indotek-karya-nusantara'
)
INSERT INTO public.profiles (id, full_name, email, phone)
VALUES
  ('22222222-2222-4222-8222-222222222222', 'Direktur Utama', 'owner@indotek.id', '081234567890'),
  ('33333333-3333-4333-8333-333333333333', 'Admin Sistem', 'admin@indotek.id', '081234567891'),
  ('44444444-4444-4444-8444-444444444444', 'Project Manager', 'pm@indotek.id', '081234567892'),
  ('55555555-5555-4555-8555-555555555555', 'Site Manager', 'site@indotek.id', '081234567893')
ON CONFLICT (id) DO NOTHING;

WITH org AS (
  SELECT id
  FROM public.organizations
  WHERE slug = 'pt-indotek-karya-nusantara'
), members AS (
  SELECT
    '22222222-2222-4222-8222-222222222222'::uuid AS user_id,
    'owner'::user_role_type AS role
  UNION ALL
  SELECT '33333333-3333-4333-8333-333333333333'::uuid, 'admin'::user_role_type
  UNION ALL
  SELECT '44444444-4444-4444-8444-444444444444'::uuid, 'project_manager'::user_role_type
  UNION ALL
  SELECT '55555555-5555-4555-8555-555555555555'::uuid, 'site_manager'::user_role_type
)
INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
SELECT org.id, members.user_id, members.role, true
FROM org
CROSS JOIN members
ON CONFLICT (organization_id, user_id) DO NOTHING;

WITH org AS (
  SELECT id
  FROM public.organizations
  WHERE slug = 'pt-indotek-karya-nusantara'
)
INSERT INTO public.projects (
  id,
  organization_id,
  code,
  name,
  client_name,
  category,
  location_address,
  location_city,
  location_province,
  contract_value,
  realized_cost,
  start_date,
  end_date,
  maintenance_days,
  retention_percent,
  planned_progress,
  actual_progress,
  status,
  project_manager_id,
  site_manager_id,
  created_by
)
SELECT
  gen_random_uuid(),
  org.id,
  'PROJ-001',
  'Gedung Kantor Cabang Bandung',
  'PT Maju Bersama',
  'Gedung',
  'Jl. Diponegoro No. 20',
  'Bandung',
  'Jawa Barat',
  2750000000,
  980000000,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '210 days',
  180,
  5,
  25,
  18,
  'active',
  '44444444-4444-4444-8444-444444444444'::uuid,
  '55555555-5555-4555-8555-555555555555'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid
FROM org
ON CONFLICT DO NOTHING;

WITH org AS (
  SELECT id
  FROM public.organizations
  WHERE slug = 'pt-indotek-karya-nusantara'
)
INSERT INTO public.projects (
  id,
  organization_id,
  code,
  name,
  client_name,
  category,
  location_address,
  location_city,
  location_province,
  contract_value,
  realized_cost,
  start_date,
  end_date,
  maintenance_days,
  retention_percent,
  planned_progress,
  actual_progress,
  status,
  project_manager_id,
  site_manager_id,
  created_by
)
SELECT
  gen_random_uuid(),
  org.id,
  'PROJ-002',
  'Pekerjaan Renovasi Pabrik',
  'PT Sumber Tekstil',
  'Industri',
  'Jl. Industri 3',
  'Cikarang',
  'Jawa Barat',
  1850000000,
  740000000,
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '180 days',
  120,
  3,
  42,
  33,
  'active',
  '44444444-4444-4444-8444-444444444444'::uuid,
  '55555555-5555-4555-8555-555555555555'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid
FROM org
ON CONFLICT DO NOTHING;

WITH org AS (
  SELECT id
  FROM public.organizations
  WHERE slug = 'pt-indotek-karya-nusantara'
)
INSERT INTO public.roles_permissions (organization_id, role, module, action, allowed)
SELECT org.id, role, module, action, allowed
FROM org
CROSS JOIN (
  VALUES
    ('owner'::user_role_type, 'dashboard', 'view', true),
    ('owner'::user_role_type, 'projects', 'create', true),
    ('owner'::user_role_type, 'projects', 'approve', true),
    ('admin'::user_role_type, 'projects', 'create', true),
    ('admin'::user_role_type, 'projects', 'edit', true),
    ('project_manager'::user_role_type, 'projects', 'edit', true),
    ('site_manager'::user_role_type, 'daily_reports', 'create', true),
    ('site_manager'::user_role_type, 'daily_reports', 'approve', true)
) AS v(role, module, action, allowed)
ON CONFLICT (organization_id, role, module, action) DO NOTHING;

-- ==============================================================================
-- INDOTEK PRO — FONDASI TENANT (T-1.3)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.roles_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role user_role_type NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (organization_id, role, module, action)
);

CREATE INDEX IF NOT EXISTS idx_roles_permissions_org_role
  ON public.roles_permissions (organization_id, role, module, action);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))), ''),
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS trg_org_members_updated_at ON public.organization_members;
DROP TRIGGER IF EXISTS trg_roles_permissions_updated_at ON public.roles_permissions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_org_members_updated_at
BEFORE UPDATE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_roles_permissions_updated_at
BEFORE UPDATE ON public.roles_permissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.roles_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles permissions viewable by org members"
ON public.roles_permissions
FOR SELECT
USING (public.is_org_member(organization_id));

CREATE POLICY "Roles permissions managed by owner or admin"
ON public.roles_permissions
FOR ALL
USING (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]))
WITH CHECK (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]));

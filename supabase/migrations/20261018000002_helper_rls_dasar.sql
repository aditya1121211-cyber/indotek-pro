-- ==============================================================================
-- INDOTEK PRO — FUNGSI HELPER & RLS DASAR (T-1.4)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role(target_org_id UUID)
RETURNS user_role_type
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT role
  FROM public.organization_members
  WHERE organization_id = target_org_id
    AND user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(target_org_id UUID, allowed_roles user_role_type[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
      AND is_active = true
      AND role = ANY(allowed_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.current_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND is_active = true;
$$;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscriptions viewable by org members"
ON public.subscriptions FOR SELECT
USING (public.is_org_member(organization_id));

CREATE POLICY "Subscriptions managed by owner or admin"
ON public.subscriptions FOR ALL
USING (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]))
WITH CHECK (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]));

CREATE POLICY "Organization members can view own membership"
ON public.organization_members FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_org_member(organization_id)
);

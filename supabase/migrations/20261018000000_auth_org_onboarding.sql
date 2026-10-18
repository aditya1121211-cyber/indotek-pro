CREATE OR REPLACE FUNCTION public.create_organization_with_owner(org_data jsonb DEFAULT '{}'::jsonb)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_email text := auth.jwt() ->> 'email';
  new_org public.organizations;
  org_name text := btrim(org_data ->> 'name');
  org_slug text := lower(regexp_replace(btrim(org_data ->> 'slug'), '[^a-z0-9-]+', '-', 'g'));
BEGIN
  IF current_user_id IS NULL OR current_email IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF org_name IS NULL OR org_name = '' OR org_slug IS NULL OR org_slug = '' THEN
    RAISE EXCEPTION 'Organization name and slug are required';
  END IF;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    current_user_id,
    COALESCE(NULLIF(btrim(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''), split_part(current_email, '@', 1)),
    current_email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.organizations (name, slug, company_code, address, city, province, postal_code, phone, email, npwp, nib, timezone)
  VALUES (
    org_name,
    org_slug,
    COALESCE(NULLIF(org_data ->> 'company_code', ''), 'IND'),
    org_data ->> 'address', org_data ->> 'city', org_data ->> 'province', org_data ->> 'postal_code',
    org_data ->> 'phone', org_data ->> 'email', org_data ->> 'npwp', org_data ->> 'nib',
    COALESCE(NULLIF(org_data ->> 'timezone', ''), 'WIB')
  ) RETURNING * INTO new_org;

  INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
  VALUES (new_org.id, current_user_id, 'owner', true);

  RETURN new_org;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization_with_owner(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(jsonb) TO authenticated;

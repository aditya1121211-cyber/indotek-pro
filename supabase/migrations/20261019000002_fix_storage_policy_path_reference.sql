DROP POLICY IF EXISTS "Organization project files readable by org members"
ON storage.objects;

CREATE POLICY "Organization project files readable by org members"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(storage.objects.name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(storage.objects.name))[1]
      AND p.id::text = (storage.foldername(storage.objects.name))[2]
      AND public.is_org_member(p.organization_id)
  )
);

DROP POLICY IF EXISTS "Organization project files uploadable by field roles"
ON storage.objects;

CREATE POLICY "Organization project files uploadable by field roles"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(storage.objects.name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(storage.objects.name))[1]
      AND p.id::text = (storage.foldername(storage.objects.name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

DROP POLICY IF EXISTS "Organization project files updatable by field roles"
ON storage.objects;

CREATE POLICY "Organization project files updatable by field roles"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(storage.objects.name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(storage.objects.name))[1]
      AND p.id::text = (storage.foldername(storage.objects.name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
)
WITH CHECK (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(storage.objects.name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(storage.objects.name))[1]
      AND p.id::text = (storage.foldername(storage.objects.name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

DROP POLICY IF EXISTS "Organization project files deletable by managers"
ON storage.objects;

CREATE POLICY "Organization project files deletable by managers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(storage.objects.name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(storage.objects.name))[1]
      AND p.id::text = (storage.foldername(storage.objects.name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type]
      )
  )
);

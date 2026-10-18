DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'org-logos'
      AND (
        name <> 'org-logos'
        OR public
        OR file_size_limit IS DISTINCT FROM 2097152
        OR allowed_mime_types IS DISTINCT FROM ARRAY['image/webp']::text[]
      )
  ) THEN
    RAISE EXCEPTION 'The org-logos bucket exists with an incompatible configuration';
  END IF;

  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'org-logos',
    'org-logos',
    false,
    2097152,
    ARRAY['image/webp']
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

DROP POLICY IF EXISTS "Organization logos readable by org members"
ON storage.objects;

CREATE POLICY "Organization logos readable by org members"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'org-logos'
  AND cardinality(storage.foldername(storage.objects.name)) = 1
  AND EXISTS (
    SELECT 1
    FROM public.organizations o
    WHERE o.id::text = (storage.foldername(storage.objects.name))[1]
      AND public.is_org_member(o.id)
  )
);

DROP POLICY IF EXISTS "Organization logos uploadable by owner or admin"
ON storage.objects;

CREATE POLICY "Organization logos uploadable by owner or admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-logos'
  AND cardinality(storage.foldername(storage.objects.name)) = 1
  AND EXISTS (
    SELECT 1
    FROM public.organizations o
    WHERE o.id::text = (storage.foldername(storage.objects.name))[1]
      AND public.has_role(
        o.id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type]
      )
  )
);

DROP POLICY IF EXISTS "Organization logos deletable by owner or admin"
ON storage.objects;

CREATE POLICY "Organization logos deletable by owner or admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'org-logos'
  AND cardinality(storage.foldername(storage.objects.name)) = 1
  AND EXISTS (
    SELECT 1
    FROM public.organizations o
    WHERE o.id::text = (storage.foldername(storage.objects.name))[1]
      AND public.has_role(
        o.id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type]
      )
  )
);

-- Tenant-scoped policies for phase-two tables and private project file storage.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'org-project-files'
      AND (name <> 'org-project-files' OR public)
  ) THEN
    RAISE EXCEPTION 'The org-project-files bucket exists with an incompatible configuration';
  END IF;

  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'org-project-files',
    'org-project-files',
    false,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE POLICY "Project addendums readable by org members"
ON public.project_addendums FOR SELECT
USING (
  public.is_org_member(organization_id)
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_addendums.project_id
      AND p.organization_id = project_addendums.organization_id
  )
);

CREATE POLICY "Project addendums manageable by project managers"
ON public.project_addendums FOR ALL
USING (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_addendums.project_id
      AND p.organization_id = project_addendums.organization_id
  )
)
WITH CHECK (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_addendums.project_id
      AND p.organization_id = project_addendums.organization_id
  )
);

CREATE POLICY "Daily report equipment readable by org members"
ON public.daily_report_equipment FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_equipment.report_id
      AND public.is_org_member(r.organization_id)
  )
);

CREATE POLICY "Daily report equipment manageable by field roles"
ON public.daily_report_equipment FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_equipment.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_equipment.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

CREATE POLICY "Daily report manpower readable by org members"
ON public.daily_report_manpower FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_manpower.report_id
      AND public.is_org_member(r.organization_id)
  )
);

CREATE POLICY "Daily report manpower manageable by field roles"
ON public.daily_report_manpower FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_manpower.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_manpower.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

CREATE POLICY "Daily report materials readable by org members"
ON public.daily_report_materials FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_materials.report_id
      AND public.is_org_member(r.organization_id)
  )
);

CREATE POLICY "Daily report materials manageable by field roles"
ON public.daily_report_materials FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_materials.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_materials.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

CREATE POLICY "Daily report photos readable by org members"
ON public.daily_report_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_photos.report_id
      AND public.is_org_member(r.organization_id)
  )
);

CREATE POLICY "Daily report photos manageable by field roles"
ON public.daily_report_photos FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_photos.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.daily_site_reports r
    WHERE r.id = daily_report_photos.report_id
      AND public.has_role(
        r.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

CREATE POLICY "AHSP resources manageable by estimators"
ON public.ahsp_resources FOR ALL
USING (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'estimator'::user_role_type]
  )
)
WITH CHECK (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'estimator'::user_role_type]
  )
);

CREATE POLICY "AHSP templates manageable by estimators"
ON public.ahsp_templates FOR ALL
USING (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'estimator'::user_role_type]
  )
)
WITH CHECK (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'estimator'::user_role_type]
  )
);

CREATE POLICY "Project BOQs manageable by estimators"
ON public.project_boqs FOR ALL
USING (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'estimator'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_boqs.project_id
      AND p.organization_id = project_boqs.organization_id
  )
)
WITH CHECK (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'estimator'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = project_boqs.project_id
      AND p.organization_id = project_boqs.organization_id
  )
);

CREATE POLICY "Project BOQ items manageable by estimators"
ON public.project_boq_items FOR ALL
USING (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'estimator'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.project_boqs b
    WHERE b.id = project_boq_items.boq_id
      AND b.organization_id = project_boq_items.organization_id
      AND b.project_id = project_boq_items.project_id
  )
)
WITH CHECK (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'estimator'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.project_boqs b
    WHERE b.id = project_boq_items.boq_id
      AND b.organization_id = project_boq_items.organization_id
      AND b.project_id = project_boq_items.project_id
  )
);

CREATE POLICY "Daily site reports manageable by field roles"
ON public.daily_site_reports FOR ALL
USING (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = daily_site_reports.project_id
      AND p.organization_id = daily_site_reports.organization_id
  )
)
WITH CHECK (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = daily_site_reports.project_id
      AND p.organization_id = daily_site_reports.organization_id
  )
);

CREATE POLICY "Weekly progress curves manageable by project roles"
ON public.weekly_progress_curves FOR ALL
USING (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = weekly_progress_curves.project_id
      AND p.organization_id = weekly_progress_curves.organization_id
  )
)
WITH CHECK (
  public.has_role(
    organization_id,
    ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type]
  )
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = weekly_progress_curves.project_id
      AND p.organization_id = weekly_progress_curves.organization_id
  )
);

CREATE POLICY "Organization project files readable by org members"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(name))[1]
      AND p.id::text = (storage.foldername(name))[2]
      AND public.is_org_member(p.organization_id)
  )
);

CREATE POLICY "Organization project files uploadable by field roles"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(name))[1]
      AND p.id::text = (storage.foldername(name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

CREATE POLICY "Organization project files updatable by field roles"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(name))[1]
      AND p.id::text = (storage.foldername(name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
)
WITH CHECK (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(name))[1]
      AND p.id::text = (storage.foldername(name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type, 'site_manager'::user_role_type]
      )
  )
);

CREATE POLICY "Organization project files deletable by managers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'org-project-files'
  AND cardinality(storage.foldername(name)) >= 2
  AND EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.organization_id::text = (storage.foldername(name))[1]
      AND p.id::text = (storage.foldername(name))[2]
      AND public.has_role(
        p.organization_id,
        ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type]
      )
  )
);

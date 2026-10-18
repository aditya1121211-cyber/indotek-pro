-- ==============================================================================
-- INDOTEK PRO — CORE PROJECTS & DOCUMENT NUMBERING (T-1.5)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'site_manager',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.doc_number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  year INT NOT NULL,
  prefix TEXT NOT NULL DEFAULT '',
  last_value INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (organization_id, entity_type, year)
);

CREATE INDEX IF NOT EXISTS idx_project_members_org_project
  ON public.project_members (organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user
  ON public.project_members (user_id);
CREATE INDEX IF NOT EXISTS idx_doc_numbers_org_entity_year
  ON public.doc_number_sequences (organization_id, entity_type, year);

CREATE OR REPLACE FUNCTION public.log_entity_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  organization_uuid UUID;
  project_uuid UUID;
  entity_id_text TEXT;
BEGIN
  organization_uuid := COALESCE(
    NEW.organization_id,
    OLD.organization_id,
    NULL
  );

  project_uuid := COALESCE(
    NEW.project_id,
    OLD.project_id,
    NULL
  );

  entity_id_text := COALESCE(
    (NEW.id)::text,
    (OLD.id)::text,
    'unknown'
  );

  IF TG_OP = 'INSERT' THEN
    IF organization_uuid IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        organization_id,
        project_id,
        user_id,
        action,
        entity_type,
        entity_id,
        new_data,
        created_at
      ) VALUES (
        organization_uuid,
        project_uuid,
        auth.uid(),
        'INSERT',
        TG_TABLE_NAME,
        entity_id_text,
        to_jsonb(NEW),
        timezone('utc'::text, now())
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF organization_uuid IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        organization_id,
        project_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        created_at
      ) VALUES (
        organization_uuid,
        project_uuid,
        auth.uid(),
        'UPDATE',
        TG_TABLE_NAME,
        entity_id_text,
        to_jsonb(OLD),
        to_jsonb(NEW),
        timezone('utc'::text, now())
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF organization_uuid IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        organization_id,
        project_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        created_at
      ) VALUES (
        organization_uuid,
        project_uuid,
        auth.uid(),
        'DELETE',
        TG_TABLE_NAME,
        entity_id_text,
        to_jsonb(OLD),
        timezone('utc'::text, now())
      );
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_audit ON public.projects;
DROP TRIGGER IF EXISTS trg_project_members_audit ON public.project_members;
DROP TRIGGER IF EXISTS trg_notifications_audit ON public.notifications;
DROP TRIGGER IF EXISTS trg_org_audit ON public.organizations;
DROP TRIGGER IF EXISTS trg_subscription_audit ON public.subscriptions;

CREATE TRIGGER trg_projects_audit
AFTER INSERT OR UPDATE OF name, code, status, contract_value, realized_cost, start_date, end_date, project_manager_id, site_manager_id, notes, deleted_at OR DELETE
ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.log_entity_audit();

CREATE TRIGGER trg_project_members_audit
AFTER INSERT OR UPDATE OF role, joined_at OR DELETE
ON public.project_members
FOR EACH ROW EXECUTE FUNCTION public.log_entity_audit();

CREATE TRIGGER trg_notifications_audit
AFTER INSERT OR UPDATE OF title, message, type, is_read, link OR DELETE
ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.log_entity_audit();

CREATE OR REPLACE FUNCTION public.generate_document_number(p_entity_type TEXT, p_organization_id UUID, p_prefix TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  current_year INT := EXTRACT(YEAR FROM now())::INT;
  row_record RECORD;
  next_value INT;
BEGIN
  INSERT INTO public.doc_number_sequences (organization_id, entity_type, year, prefix, last_value)
  VALUES (p_organization_id, lower(trim(p_entity_type)), current_year, upper(trim(p_prefix)), 0)
  ON CONFLICT (organization_id, entity_type, year)
  DO NOTHING;

  SELECT * INTO row_record
  FROM public.doc_number_sequences
  WHERE organization_id = p_organization_id
    AND entity_type = lower(trim(p_entity_type))
    AND year = current_year
  FOR UPDATE;

  IF row_record IS NULL THEN
    RAISE EXCEPTION 'Unable to initialize document sequence for %', p_entity_type;
  END IF;

  next_value := row_record.last_value + 1;
  UPDATE public.doc_number_sequences
  SET last_value = next_value,
      updated_at = timezone('utc'::text, now())
  WHERE id = row_record.id;

  RETURN format('%s%s-%s-%05s',
    CASE WHEN trim(p_prefix) = '' THEN '' ELSE upper(trim(p_prefix)) || '-' END,
    current_year,
    lower(trim(p_entity_type)),
    next_value
  );
END;
$$;

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_number_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members viewable by org members"
ON public.project_members FOR SELECT
USING (public.is_org_member(organization_id));

CREATE POLICY "Project members managed by project managers and admins"
ON public.project_members FOR ALL
USING (
  public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type])
)
WITH CHECK (
  public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type, 'project_manager'::user_role_type])
);

CREATE POLICY "Doc sequences viewable by org members"
ON public.doc_number_sequences FOR SELECT
USING (public.is_org_member(organization_id));

CREATE POLICY "Doc sequences managed by owner or admin"
ON public.doc_number_sequences FOR ALL
USING (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]))
WITH CHECK (public.has_role(organization_id, ARRAY['owner'::user_role_type, 'admin'::user_role_type]));

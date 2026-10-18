-- Fix generic audit triggers for tables with different row shapes.

CREATE OR REPLACE FUNCTION public.log_entity_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  row_data JSONB;
  organization_uuid UUID;
  project_uuid UUID;
  entity_id_text TEXT;
BEGIN
  row_data := CASE
    WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
    ELSE to_jsonb(NEW)
  END;

  organization_uuid := COALESCE(
    NULLIF(row_data ->> 'organization_id', '')::UUID,
    CASE
      WHEN TG_TABLE_NAME = 'organizations' THEN NULLIF(row_data ->> 'id', '')::UUID
      ELSE NULL
    END
  );

  project_uuid := COALESCE(
    NULLIF(row_data ->> 'project_id', '')::UUID,
    CASE
      WHEN TG_TABLE_NAME = 'projects' THEN NULLIF(row_data ->> 'id', '')::UUID
      ELSE NULL
    END
  );

  entity_id_text := COALESCE(row_data ->> 'id', 'unknown');

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
      TG_OP,
      TG_TABLE_NAME,
      entity_id_text,
      CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
      timezone('utc'::text, now())
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

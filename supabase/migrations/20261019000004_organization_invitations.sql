CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (email = lower(btrim(email))),
  full_name TEXT NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  role public.user_role_type NOT NULL CHECK (role <> 'owner'::public.user_role_type),
  department TEXT,
  job_title TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked', 'expired', 'delivery_failed')),
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  accepted_by UUID REFERENCES public.profiles(id),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days'),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_organization_invitations_email_pending
  ON public.organization_invitations (lower(email), expires_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_organization_invitations_org_status
  ON public.organization_invitations (organization_id, status, created_at DESC);

DROP TRIGGER IF EXISTS trg_organization_invitations_updated_at
  ON public.organization_invitations;
CREATE TRIGGER trg_organization_invitations_updated_at
BEFORE UPDATE ON public.organization_invitations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.organization_invitations TO authenticated;
GRANT SELECT ON public.organization_invitations TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.organization_invitations FROM anon, authenticated, service_role;

DROP POLICY IF EXISTS "Invitations visible to invitee or organization managers"
  ON public.organization_invitations;
CREATE POLICY "Invitations visible to invitee or organization managers"
ON public.organization_invitations FOR SELECT
USING (
  (
    status = 'pending'
    AND expires_at > timezone('utc'::text, now())
    AND lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  )
  OR public.has_role(
    organization_id,
    ARRAY['owner'::public.user_role_type, 'admin'::public.user_role_type]
  )
);

DROP POLICY IF EXISTS "Members manageable by owner and admin"
  ON public.organization_members;

CREATE OR REPLACE FUNCTION public.create_organization_invitation(
  p_organization_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_role public.user_role_type,
  p_department TEXT,
  p_job_title TEXT,
  p_invited_by UUID
)
RETURNS public.organization_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  inviter_role public.user_role_type;
  created_invitation public.organization_invitations;
BEGIN
  SELECT role
  INTO inviter_role
  FROM public.organization_members
  WHERE organization_id = p_organization_id
    AND user_id = p_invited_by
    AND is_active = true;

  IF inviter_role IS NULL OR inviter_role NOT IN ('owner'::public.user_role_type, 'admin'::public.user_role_type) THEN
    RAISE EXCEPTION 'Anda tidak memiliki izin untuk mengundang anggota organisasi ini.';
  END IF;

  IF p_role = 'owner'::public.user_role_type THEN
    RAISE EXCEPTION 'Role owner hanya dapat diberikan melalui proses transfer kepemilikan.';
  END IF;

  IF inviter_role = 'admin'::public.user_role_type AND p_role = 'admin'::public.user_role_type THEN
    RAISE EXCEPTION 'Hanya owner yang dapat mengundang admin lain.';
  END IF;

  INSERT INTO public.organization_invitations (
    organization_id,
    email,
    full_name,
    role,
    department,
    job_title,
    status,
    invited_by,
    accepted_by,
    accepted_at,
    expires_at,
    created_by
  )
  VALUES (
    p_organization_id,
    lower(btrim(p_email)),
    btrim(p_full_name),
    p_role,
    NULLIF(btrim(p_department), ''),
    NULLIF(btrim(p_job_title), ''),
    'pending',
    p_invited_by,
    NULL,
    NULL,
    timezone('utc'::text, now()) + INTERVAL '7 days',
    p_invited_by
  )
  ON CONFLICT (organization_id, email) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      department = EXCLUDED.department,
      job_title = EXCLUDED.job_title,
      status = 'pending',
      invited_by = EXCLUDED.invited_by,
      accepted_by = NULL,
      accepted_at = NULL,
      expires_at = EXCLUDED.expires_at,
      created_by = EXCLUDED.created_by,
      updated_at = timezone('utc'::text, now())
  RETURNING * INTO created_invitation;

  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    new_data
  )
  VALUES (
    p_organization_id,
    p_invited_by,
    'INVITE_MEMBER',
    'organization_invitation',
    created_invitation.id::TEXT,
    jsonb_build_object(
      'email', created_invitation.email,
      'role', created_invitation.role,
      'status', created_invitation.status
    )
  );

  RETURN created_invitation;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization_invitation(
  UUID, TEXT, TEXT, public.user_role_type, TEXT, TEXT, UUID
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_invitation(
  UUID, TEXT, TEXT, public.user_role_type, TEXT, TEXT, UUID
) TO service_role;

CREATE OR REPLACE FUNCTION public.mark_organization_invitation_delivery_failed(
  p_invitation_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  failed_invitation public.organization_invitations;
BEGIN
  UPDATE public.organization_invitations
  SET status = 'delivery_failed',
      updated_at = timezone('utc'::text, now())
  WHERE id = p_invitation_id
    AND status = 'pending'
  RETURNING * INTO failed_invitation;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  )
  VALUES (
    failed_invitation.organization_id,
    failed_invitation.invited_by,
    'INVITATION_DELIVERY_FAILED',
    'organization_invitation',
    failed_invitation.id::TEXT,
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('email', failed_invitation.email, 'status', failed_invitation.status)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.mark_organization_invitation_delivery_failed(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_organization_invitation_delivery_failed(UUID)
  TO service_role;

CREATE OR REPLACE FUNCTION public.accept_organization_invitation(
  p_invitation_id UUID,
  p_user_id UUID,
  p_email TEXT
)
RETURNS public.organization_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  invitation public.organization_invitations;
  existing_member public.organization_members;
  accepted_member public.organization_members;
  profile_email TEXT;
BEGIN
  SELECT lower(email)
  INTO profile_email
  FROM public.profiles
  WHERE id = p_user_id;

  IF profile_email IS NULL OR profile_email <> lower(btrim(p_email)) THEN
    RAISE EXCEPTION 'Email akun tidak cocok dengan undangan.';
  END IF;

  SELECT *
  INTO invitation
  FROM public.organization_invitations
  WHERE id = p_invitation_id
  FOR UPDATE;

  IF NOT FOUND OR invitation.status <> 'pending' THEN
    RAISE EXCEPTION 'Undangan tidak tersedia atau sudah digunakan.';
  END IF;

  IF invitation.expires_at <= timezone('utc'::text, now()) THEN
    RAISE EXCEPTION 'Undangan sudah kedaluwarsa. Minta owner atau admin mengirim undangan baru.';
  END IF;

  IF invitation.email <> lower(btrim(p_email)) THEN
    RAISE EXCEPTION 'Email akun tidak cocok dengan undangan.';
  END IF;

  SELECT *
  INTO existing_member
  FROM public.organization_members
  WHERE organization_id = invitation.organization_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF FOUND AND existing_member.is_active THEN
    RAISE EXCEPTION 'Akun ini sudah menjadi anggota organisasi.';
  END IF;

  IF FOUND AND existing_member.role = 'owner'::public.user_role_type THEN
    RAISE EXCEPTION 'Akun owner tidak dapat menerima undangan dengan role lain.';
  END IF;

  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    department,
    job_title,
    is_active,
    invited_by,
    joined_at
  )
  VALUES (
    invitation.organization_id,
    p_user_id,
    invitation.role,
    invitation.department,
    invitation.job_title,
    true,
    invitation.invited_by,
    timezone('utc'::text, now())
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE
  SET role = EXCLUDED.role,
      department = EXCLUDED.department,
      job_title = EXCLUDED.job_title,
      is_active = true,
      invited_by = EXCLUDED.invited_by,
      joined_at = EXCLUDED.joined_at,
      updated_at = timezone('utc'::text, now())
  RETURNING * INTO accepted_member;

  UPDATE public.organization_invitations
  SET status = 'accepted',
      accepted_by = p_user_id,
      accepted_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = invitation.id;

  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    new_data
  )
  VALUES (
    invitation.organization_id,
    p_user_id,
    'ACCEPT_INVITATION',
    'organization_member',
    accepted_member.id::TEXT,
    jsonb_build_object('role', accepted_member.role, 'is_active', accepted_member.is_active)
  );

  RETURN accepted_member;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_organization_invitation(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_organization_invitation(UUID, UUID, TEXT)
  TO service_role;

CREATE OR REPLACE FUNCTION public.manage_organization_member_access(
  p_member_id UUID,
  p_role public.user_role_type,
  p_is_active BOOLEAN
)
RETURNS public.organization_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  target_member public.organization_members;
  updated_member public.organization_members;
  manager_role public.user_role_type;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sesi pengguna tidak valid.';
  END IF;

  IF p_role IS NULL AND p_is_active IS NULL THEN
    RAISE EXCEPTION 'Tidak ada perubahan akses yang diminta.';
  END IF;

  SELECT *
  INTO target_member
  FROM public.organization_members
  WHERE id = p_member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Anggota tidak ditemukan.';
  END IF;

  SELECT role
  INTO manager_role
  FROM public.organization_members
  WHERE organization_id = target_member.organization_id
    AND user_id = auth.uid()
    AND is_active = true;

  IF manager_role IS NULL OR manager_role NOT IN ('owner'::public.user_role_type, 'admin'::public.user_role_type) THEN
    RAISE EXCEPTION 'Anda tidak memiliki izin untuk mengelola anggota organisasi ini.';
  END IF;

  IF target_member.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Anda tidak dapat mengubah akses akun sendiri.';
  END IF;

  IF target_member.role = 'owner'::public.user_role_type THEN
    RAISE EXCEPTION 'Akses owner hanya dapat diubah melalui proses transfer kepemilikan.';
  END IF;

  IF p_role = 'owner'::public.user_role_type THEN
    RAISE EXCEPTION 'Role owner hanya dapat diberikan melalui proses transfer kepemilikan.';
  END IF;

  IF manager_role = 'admin'::public.user_role_type
    AND (target_member.role = 'admin'::public.user_role_type OR p_role = 'admin'::public.user_role_type) THEN
    RAISE EXCEPTION 'Hanya owner yang dapat mengelola role admin.';
  END IF;

  UPDATE public.organization_members
  SET role = COALESCE(p_role, role),
      is_active = COALESCE(p_is_active, is_active),
      updated_at = timezone('utc'::text, now())
  WHERE id = target_member.id
  RETURNING * INTO updated_member;

  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  )
  VALUES (
    target_member.organization_id,
    auth.uid(),
    'UPDATE_MEMBER_ACCESS',
    'organization_member',
    target_member.id::TEXT,
    jsonb_build_object('role', target_member.role, 'is_active', target_member.is_active),
    jsonb_build_object('role', updated_member.role, 'is_active', updated_member.is_active)
  );

  RETURN updated_member;
END;
$$;

REVOKE ALL ON FUNCTION public.manage_organization_member_access(
  UUID, public.user_role_type, BOOLEAN
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.manage_organization_member_access(
  UUID, public.user_role_type, BOOLEAN
) TO authenticated;

import {
  createClient,
  type SupabaseClient,
  type User,
} from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const INVITABLE_ROLES = new Set([
  "admin",
  "project_manager",
  "site_manager",
  "estimator",
  "procurement",
  "finance",
  "warehouse",
  "safety_officer",
  "subcontractor",
  "client_viewer",
]);

type RequestBody = {
  action?: unknown;
  organization_id?: unknown;
  email?: unknown;
  full_name?: unknown;
  role?: unknown;
  department?: unknown;
  member_id?: unknown;
  is_active?: unknown;
  invitation_id?: unknown;
};

type InvitationRecord = {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  expires_at: string;
};

type ProfileRecord = {
  id: string;
  email: string;
};

class HttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new HttpError(`Konfigurasi Function ${name} belum tersedia.`, 500);
  }
  return value;
}

function parseUuid(value: unknown, fieldName: string): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(value)
  ) {
    throw new HttpError(`${fieldName} tidak valid.`, 400);
  }
  return value;
}

function parseRole(value: unknown): string {
  if (typeof value !== "string" || !INVITABLE_ROLES.has(value)) {
    throw new HttpError("Role anggota tidak valid.", 400);
  }
  return value;
}

function createUserClient(
  url: string,
  anonKey: string,
  authorization: string,
): SupabaseClient {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireManager(
  userClient: SupabaseClient,
  organizationId: string,
): Promise<"owner" | "admin"> {
  const { data, error } = await userClient.rpc("current_user_role", {
    target_org_id: organizationId,
  });
  if (error) throw new HttpError("Gagal memeriksa hak akses organisasi.", 500);
  if (data !== "owner" && data !== "admin") {
    throw new HttpError(
      "Hanya owner atau admin yang dapat mengelola anggota.",
      403,
    );
  }
  return data;
}

async function sendInvitationEmail(
  url: string,
  anonKey: string,
  serviceClient: SupabaseClient,
  email: string,
  fullName: string,
  isExistingUser: boolean,
): Promise<"invitation" | "magic_link"> {
  const appUrl = requiredEnv("APP_URL");
  let redirectUrl: URL;
  try {
    redirectUrl = new URL(appUrl);
  } catch {
    throw new HttpError("Konfigurasi APP_URL pada Function tidak valid.", 500);
  }
  const isAllowedProtocol = redirectUrl.protocol === "https:" ||
    (redirectUrl.protocol === "http:" && redirectUrl.hostname === "localhost");
  if (!isAllowedProtocol || redirectUrl.username || redirectUrl.password) {
    throw new HttpError(
      "APP_URL harus menggunakan HTTPS, kecuali untuk localhost.",
      500,
    );
  }
  redirectUrl.searchParams.set("invite", "accept");

  if (isExistingUser) {
    const publicClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await publicClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectUrl.toString(),
      },
    });
    if (error) {
      throw new HttpError(
        `Email tautan masuk gagal dikirim: ${error.message}`,
        502,
      );
    }
    return "magic_link";
  }

  const { error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: redirectUrl.toString(),
  });
  if (error) {
    throw new HttpError(`Email undangan gagal dikirim: ${error.message}`, 502);
  }
  return "invitation";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Metode tidak didukung." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Sesi pengguna tidak valid." }, 401);
  }

  try {
    const url = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const userClient = createUserClient(url, anonKey, authorization);
    const serviceClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const accessToken = authorization.slice("Bearer ".length).trim();
    const { data: userData, error: userError } = await userClient.auth.getUser(
      accessToken,
    );
    const user: User | null = userData.user;
    if (userError || !user?.id || !user.email) {
      throw new HttpError(
        "Sesi pengguna tidak valid atau sudah berakhir.",
        401,
      );
    }

    let body: RequestBody;
    try {
      body = await request.json() as RequestBody;
    } catch {
      throw new HttpError("Isi permintaan tidak valid.", 400);
    }

    if (body.action === "invite") {
      const organizationId = parseUuid(body.organization_id, "ID organisasi");
      const inviterRole = await requireManager(userClient, organizationId);
      const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
      const fullName = typeof body.full_name === "string"
        ? body.full_name.trim()
        : "";
      const role = parseRole(body.role);
      const department = typeof body.department === "string"
        ? body.department.trim()
        : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        throw new HttpError("Masukkan alamat email yang valid.", 400);
      }
      if (fullName.length < 2 || fullName.length > 120) {
        throw new HttpError(
          "Nama anggota harus terdiri dari 2 sampai 120 karakter.",
          400,
        );
      }
      if (department.length > 120) {
        throw new HttpError("Nama departemen maksimal 120 karakter.", 400);
      }
      if (inviterRole === "admin" && role === "admin") {
        throw new HttpError(
          "Hanya owner yang dapat mengundang admin lain.",
          403,
        );
      }

      const { data: targetProfiles, error: targetProfileError } =
        await serviceClient
          .from("profiles")
          .select("id, email")
          .ilike("email", email)
          .limit(10);
      if (targetProfileError) {
        throw new HttpError("Gagal memeriksa anggota tujuan undangan.", 500);
      }
      const targetProfile = (targetProfiles as ProfileRecord[] | null)?.find(
        (profile) => profile.email?.toLowerCase() === email,
      ) ?? null;
      if (targetProfile) {
        const { data: existingMember, error: memberError } = await serviceClient
          .from("organization_members")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("user_id", targetProfile.id)
          .eq("is_active", true)
          .maybeSingle();
        if (memberError) {
          throw new HttpError("Gagal memeriksa keanggotaan organisasi.", 500);
        }
        if (existingMember) {
          throw new HttpError(
            "Pengguna tersebut sudah menjadi anggota aktif organisasi ini.",
            409,
          );
        }
      }

      const { data: invitation, error: invitationError } = await serviceClient
        .rpc(
          "create_organization_invitation",
          {
            p_organization_id: organizationId,
            p_email: email,
            p_full_name: fullName,
            p_role: role,
            p_department: department || null,
            p_job_title: null,
            p_invited_by: user.id,
          },
        );
      if (invitationError || !invitation) {
        throw new HttpError(
          invitationError?.message ?? "Undangan gagal disimpan.",
          400,
        );
      }

      try {
        const delivery = await sendInvitationEmail(
          url,
          anonKey,
          serviceClient,
          email,
          fullName,
          targetProfile !== null,
        );
        return jsonResponse({
          invitation_id: (invitation as InvitationRecord).id,
          delivery,
          message: delivery === "magic_link"
            ? "Tautan masuk telah dikirim. Setelah masuk, penerima dapat menerima undangan ini."
            : "Undangan telah dikirim melalui email.",
        });
      } catch (error) {
        const { error: updateError } = await serviceClient.rpc(
          "mark_organization_invitation_delivery_failed",
          { p_invitation_id: (invitation as InvitationRecord).id },
        );
        if (updateError) {
          console.error(
            "Failed to mark invitation delivery failure",
            updateError,
          );
        }
        throw error;
      }
    }

    if (body.action === "list_invitations") {
      if (!user.email_confirmed_at) {
        throw new HttpError(
          "Konfirmasi alamat email untuk melihat undangan.",
          403,
        );
      }
      const email = user.email.trim().toLowerCase();
      const { data: invitations, error } = await serviceClient
        .from("organization_invitations")
        .select(
          "id, organization_id, email, full_name, role, department, expires_at",
        )
        .eq("email", email)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw new HttpError("Undangan organisasi gagal dimuat.", 500);

      const organizationIds = [
        ...new Set(
          (invitations ?? []).map((invitation) => invitation.organization_id),
        ),
      ];
      const { data: organizations, error: organizationsError } =
        organizationIds.length
          ? await serviceClient.from("organizations").select("id, name").in(
            "id",
            organizationIds,
          )
          : { data: [], error: null };
      if (organizationsError) {
        throw new HttpError("Nama organisasi undangan gagal dimuat.", 500);
      }

      const organizationNames = new Map(
        (organizations ?? []).map((
          organization,
        ) => [organization.id, organization.name]),
      );
      return jsonResponse({
        invitations: (invitations ?? []).map((invitation) => ({
          id: invitation.id,
          organization_id: invitation.organization_id,
          organization_name:
            organizationNames.get(invitation.organization_id) ?? "Organisasi",
          full_name: invitation.full_name,
          role: invitation.role,
          department: invitation.department,
          expires_at: invitation.expires_at,
        })),
      });
    }

    if (body.action === "accept_invitation") {
      if (!user.email_confirmed_at) {
        throw new HttpError(
          "Konfirmasi alamat email sebelum menerima undangan.",
          403,
        );
      }
      const invitationId = parseUuid(body.invitation_id, "ID undangan");
      const { data, error } = await serviceClient.rpc(
        "accept_organization_invitation",
        {
          p_invitation_id: invitationId,
          p_user_id: user.id,
          p_email: user.email.trim().toLowerCase(),
        },
      );
      if (error || !data) {
        throw new HttpError(error?.message ?? "Undangan gagal diterima.", 400);
      }
      return jsonResponse({
        organization_id: data.organization_id,
        message: "Undangan berhasil diterima.",
      });
    }

    if (body.action === "manage_member") {
      const memberId = parseUuid(body.member_id, "ID anggota");
      const role = body.role === undefined ? null : parseRole(body.role);
      const isActive = typeof body.is_active === "boolean"
        ? body.is_active
        : null;
      if (body.is_active !== undefined && typeof body.is_active !== "boolean") {
        throw new HttpError("Status anggota tidak valid.", 400);
      }
      const { data, error } = await userClient.rpc(
        "manage_organization_member_access",
        {
          p_member_id: memberId,
          p_role: role,
          p_is_active: isActive,
        },
      );
      if (error || !data) {
        throw new HttpError(
          error?.message ?? "Perubahan hak akses anggota gagal.",
          400,
        );
      }
      return jsonResponse({
        member: data,
        message: "Hak akses anggota berhasil diperbarui.",
      });
    }

    throw new HttpError("Tindakan undangan tidak dikenal.", 400);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }
    console.error("organization-members function failed", error);
    return jsonResponse({
      error: "Terjadi kesalahan saat mengelola anggota. Coba lagi.",
    }, 500);
  }
});

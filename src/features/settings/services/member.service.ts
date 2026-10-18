import { FunctionsHttpError } from '@supabase/supabase-js';
import { getSupabase } from '../../../lib/supabase';
import type { InvitableMemberRole } from '../../../utils/permissions';
import { memberMessages } from '../../../i18n/id';
import {
  inviteDemoMember,
  setDemoMemberStatus,
  updateDemoMemberRole,
} from '../../../services/dataService';
import {
  type MemberInvitationInput,
  pendingInvitationsResponseSchema,
  type PendingOrganizationInvitation,
} from '../schemas/member.schema';

const FUNCTION_NAME = 'organization-members';

type FunctionResponse = {
  delivery?: 'invitation' | 'magic_link';
  message?: string;
  invitations?: unknown;
  error?: string;
  organization_id?: string;
  member?: unknown;
};

async function invokeMemberFunction<T extends FunctionResponse>(
  body: Record<string, string | boolean | null>,
): Promise<T> {
  const supabase = getSupabase();
  if (!supabase) throw new Error(memberMessages.invitationConnectionMissing);

  const { data, error } = await supabase.functions.invoke<T>(FUNCTION_NAME, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const responseBody = await error.context.json() as { error?: unknown };
        if (typeof responseBody.error === 'string') throw new Error(responseBody.error);
      } catch (responseError) {
        if (responseError instanceof Error && responseError.message !== error.message) {
          throw responseError;
        }
      }
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error(memberMessages.invitationServiceUnavailable);
  if (typeof data.error === 'string') throw new Error(data.error);
  return data;
}

export async function sendMemberInvitation(
  input: MemberInvitationInput,
): Promise<{ delivery: 'invitation' | 'magic_link' | 'demo'; message: string }> {
  if (!getSupabase()) {
    await inviteDemoMember({ ...input, job_title: input.role });
    return { delivery: 'demo', message: memberMessages.demoInvitationNotice };
  }

  const result = await invokeMemberFunction<FunctionResponse>({
    action: 'invite',
    organization_id: input.organization_id,
    full_name: input.full_name,
    email: input.email,
    role: input.role,
    department: input.department,
  });
  if (!result.delivery || !result.message) {
    throw new Error(memberMessages.invitationResponseIncomplete);
  }
  return { delivery: result.delivery, message: result.message };
}

export async function fetchPendingOrganizationInvitations(): Promise<PendingOrganizationInvitation[]> {
  if (!getSupabase()) return [];
  const response = await invokeMemberFunction<FunctionResponse>({ action: 'list_invitations' });
  const parsed = pendingInvitationsResponseSchema.safeParse({ invitations: response.invitations });
  if (!parsed.success) throw new Error(memberMessages.invitationRoleError);
  return parsed.data.invitations;
}

export async function acceptOrganizationInvitation(invitationId: string): Promise<void> {
  const result = await invokeMemberFunction<FunctionResponse>({
    action: 'accept_invitation',
    invitation_id: invitationId,
  });
  if (!result.organization_id) throw new Error(memberMessages.invitationResponseIncomplete);
}

export async function updateOrganizationMemberRole(
  memberId: string,
  role: InvitableMemberRole,
): Promise<void> {
  if (!getSupabase()) {
    await updateDemoMemberRole(memberId, role);
    return;
  }
  const result = await invokeMemberFunction<FunctionResponse>({
    action: 'manage_member',
    member_id: memberId,
    role,
  });
  if (!result.member) throw new Error(memberMessages.memberActionError);
}

export async function setOrganizationMemberStatus(
  memberId: string,
  isActive: boolean,
): Promise<void> {
  if (!getSupabase()) {
    await setDemoMemberStatus(memberId, isActive);
    return;
  }
  const result = await invokeMemberFunction<FunctionResponse>({
    action: 'manage_member',
    member_id: memberId,
    is_active: isActive,
  });
  if (!result.member) throw new Error(memberMessages.memberActionError);
}

export type MemberInvitationSendResult = Awaited<ReturnType<typeof sendMemberInvitation>>;

import { z } from 'zod';
import { INVITABLE_MEMBER_ROLES } from '../../../utils/permissions';
import { memberMessages } from '../../../i18n/id';

export const memberInvitationSchema = z.object({
  full_name: z.string().trim().min(2, memberMessages.fullNameMin).max(120, memberMessages.fullNameMax),
  email: z.string().trim().email(memberMessages.emailInvalid).max(254, memberMessages.emailMax),
  role: z.enum(INVITABLE_MEMBER_ROLES),
  department: z.string().trim().max(120, memberMessages.departmentMax),
});

export const pendingInvitationSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  organization_name: z.string(),
  full_name: z.string(),
  role: z.enum(INVITABLE_MEMBER_ROLES),
  department: z.string().nullable(),
  expires_at: z.string(),
});

export const pendingInvitationsResponseSchema = z.object({
  invitations: z.array(pendingInvitationSchema),
});

export type MemberInvitationInput = z.infer<typeof memberInvitationSchema> & {
  organization_id: string;
};
export type PendingOrganizationInvitation = z.infer<typeof pendingInvitationSchema>;

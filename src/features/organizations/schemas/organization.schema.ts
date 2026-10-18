import { z } from 'zod';
import type { Organization } from '../../../types/database';
import { organizationMessages as messages } from '../../../i18n/id';

const organizationLogoSchema = z.instanceof(File).optional()
  .refine((file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), messages.logoTypeInvalid)
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, messages.logoSizeInvalid);

export const organizationSchema = z.object({
  name: z.string().trim().min(2, messages.nameTooShort),
  companyCode: z.string().trim().min(2, messages.codeTooShort).max(6, messages.codeTooLong)
    .refine((code) => code.length === 0 || /^[A-Za-z0-9]+$/.test(code), messages.invalidCode),
  address: z.string().trim().min(5, messages.addressTooShort),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  npwp: z.string().trim().optional(),
  timezone: z.enum(['WIB', 'WITA', 'WIT']),
  logo: organizationLogoSchema,
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
export type NewOrganizationData = Omit<Organization, 'id' | 'created_at' | 'logo_url'>;

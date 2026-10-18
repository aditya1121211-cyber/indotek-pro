import { z } from 'zod';
import { authMessages as messages } from '../../../i18n/id';

export const emailSchema = z.string().trim().email(messages.emailInvalid);

export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, messages.passwordMinimum),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, messages.passwordMinimum),
  confirmPassword: z.string().min(1, messages.confirmationRequired),
}).refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: messages.passwordMismatch,
});

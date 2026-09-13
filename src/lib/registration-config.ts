import { z } from 'astro/zod';

export const registrationConfigSchema = z
  .object({
    enabled: z.boolean(),
    webAppUrl: z
      .string()
      .refine(
        (value) =>
          !value ||
          /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
            value
          ),
        'Use a URL pública do Apps Script terminada em /exec'
      ),
    emailDomain: z.literal('id.uff.br'),
    maxPdfBytes: z
      .number()
      .int()
      .min(1024)
      .max(5 * 1024 * 1024),
    maxSubmissionsPerDay: z.number().int().min(1).max(100),
    maxSubmissionsPerEmailPerDay: z.number().int().min(1).max(10),
    additionalAllowedOrigins: z.array(
      z.string().refine((value) => {
        try {
          const url = new URL(value);
          return (
            url.origin === value &&
            (url.protocol === 'https:' ||
              (url.protocol === 'http:' &&
                ['localhost', '127.0.0.1'].includes(url.hostname)))
          );
        } catch {
          return false;
        }
      }, 'Use uma origem HTTPS sem caminho (HTTP apenas para localhost)')
    ),
    privacyVersion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
  .refine((config) => !config.enabled || !!config.webAppUrl, {
    message: 'Configure webAppUrl antes de ativar as inscrições'
  });

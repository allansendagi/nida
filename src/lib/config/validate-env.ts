const REQUIRED_VARS = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_WEBHOOK_SECRET',
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

let validated = false;

export function validateEnv(): { ok: boolean; missing: string[] } {
  if (validated) return { ok: true, missing: [] };

  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('[config] Missing required environment variables:', missing.join(', '));
    return { ok: false, missing };
  }

  validated = true;
  return { ok: true, missing: [] };
}

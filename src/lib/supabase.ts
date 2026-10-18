import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  url: 'indotek_supabase_url',
  anonKey: 'indotek_supabase_anon_key',
} as const;

const SUPABASE_URL_PATTERN = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i;

export type SupabaseConfigStatus = {
  isConfigured: boolean;
  url: string;
  anonKey: string;
  source: 'env' | 'custom' | 'missing';
  errors: string[];
};

export function getSupabaseConfig(): SupabaseConfigStatus {
  const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
  const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

  const customUrl = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.url)?.trim() ?? '' : '';
  const customKey = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.anonKey)?.trim() ?? '' : '';

  const url = customUrl || envUrl;
  const anonKey = customKey || envAnonKey;

  const errors: string[] = [];
  if (!url) errors.push('VITE_SUPABASE_URL belum diisi.');
  else if (!SUPABASE_URL_PATTERN.test(url)) errors.push('VITE_SUPABASE_URL harus berupa URL Supabase yang valid.');

  if (!anonKey) errors.push('VITE_SUPABASE_ANON_KEY belum diisi.');
  else if (anonKey.length < 20) errors.push('VITE_SUPABASE_ANON_KEY terlihat tidak valid.');

  return {
    isConfigured: errors.length === 0,
    url,
    anonKey,
    source: customUrl && customKey ? 'custom' : envUrl && envAnonKey ? 'env' : 'missing',
    errors,
  };
}

export function validateSupabaseConfig(): SupabaseConfigStatus {
  return getSupabaseConfig();
}

// Optional user-configured local keys in browser session/storage
export function getSavedCredentials() {
  const { url, anonKey, source } = getSupabaseConfig();
  return {
    url,
    anonKey,
    isCustom: source === 'custom',
  };
}

export function saveCredentials(url: string, anonKey: string) {
  const normalizedUrl = url.trim();
  const normalizedKey = anonKey.trim();
  if (normalizedUrl && normalizedKey) {
    window.localStorage.setItem(STORAGE_KEYS.url, normalizedUrl);
    window.localStorage.setItem(STORAGE_KEYS.anonKey, normalizedKey);
    supabaseInstance = null;
  }
}

export function clearCustomCredentials() {
  window.localStorage.removeItem(STORAGE_KEYS.url);
  window.localStorage.removeItem(STORAGE_KEYS.anonKey);
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

export function getSupabase(): SupabaseClient | null {
  const { isConfigured, url, anonKey } = getSupabaseConfig();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
}

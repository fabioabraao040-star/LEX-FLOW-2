/**
 * LEX FLOW — Integração Oficial com Banco de Dados Supabase (PostgreSQL)
 * Documentação: https://supabase.com/docs/reference/javascript
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

class SupabaseService {
  private client: SupabaseClient | null = null;
  public isConnected = false;

  constructor() {
    this.init();
  }

  private looksLikeHtmlOrPage(value: string): boolean {
    if (!value) return true;
    // detecta tags HTML, DOCTYPE ou scripts que indicam cópia da página em vez da chave
    const htmlPattern = /<\s*!?doctype|<\s*html|<script|<\/\w+>/i;
    if (htmlPattern.test(value)) return true;
    // chave legítima não deve conter quebras de linha em excesso
    if (/\r|\n/.test(value)) return true;
    // evitar copiar URLs ou blocos longos de texto HTML
    if (value.trim().length > 4000) return true;
    return false;
  }

  private isValidUrl(value: string): boolean {
    try {
      if (!value) return false;
      const u = new URL(value);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }

  public init() {
    const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

    // Validações básicas para evitar que HTML/copypaste de páginas sejam usados como chave
    if (!this.isValidUrl(supabaseUrl)) {
      console.error('[Supabase] Variável SUPABASE_URL ausente ou com formato inválido. Verifique a configuração na Vercel.');
      this.isConnected = false;
      this.client = null;
      return;
    }

    if (!supabaseKey || this.looksLikeHtmlOrPage(supabaseKey)) {
      console.error('[Supabase] Variável SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY ausente ou inválida. Verifique a configuração na Vercel.');
      this.isConnected = false;
      this.client = null;
      return;
    }

    // Evita checar por placeholders óbvios
    if (supabaseUrl.includes('your-project') || supabaseKey.toLowerCase().includes('your_key')) {
      console.error('[Supabase] Variáveis de ambiente do Supabase parecem estar com valores de exemplo. Atualize SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.');
      this.isConnected = false;
      this.client = null;
      return;
    }

    try {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      this.isConnected = true;
      console.log('[Supabase] Conexão com Supabase inicializada.');
    } catch (err) {
      // Log seguro: não imprimir segredos
      console.error('[Supabase] Falha ao inicializar cliente Supabase. Verifique SUPABASE_URL e as chaves na configuração do ambiente.');
      this.isConnected = false;
      this.client = null;
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }
}

export const supabaseService = new SupabaseService();

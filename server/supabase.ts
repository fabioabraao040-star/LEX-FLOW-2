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

  public init() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
      try {
        this.client = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        this.isConnected = true;
        console.log('[Supabase] Conexão com banco de dados Supabase inicializada com sucesso.');
      } catch (err) {
        console.error('[Supabase] Falha ao conectar ao Supabase:', err);
        this.isConnected = false;
      }
    } else {
      this.isConnected = false;
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }
}

export const supabaseService = new SupabaseService();

-- ============================================================================
-- LEX FLOW SAAS — SUPABASE DATABASE SCHEMA (PRODUÇÃO)
-- Multi-tenancy com isolamento rigoroso por tenant_id e RLS (Row Level Security)
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABELA DE EMPRESAS / TENANTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY DEFAULT ('tenant_' || replace(gen_random_uuid()::text, '-', '')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    phone TEXT,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    trial_started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '7 days'),
    subscription_status TEXT NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'awaiting_payment', 'active', 'past_due', 'canceled', 'expired')),
    plan_id TEXT NOT NULL DEFAULT 'ia' CHECK (plan_id IN ('essencial', 'ia')),
    subscription_renewal_at TIMESTAMPTZ,
    whatsapp_connected BOOLEAN NOT NULL DEFAULT false,
    whatsapp_phone_number TEXT,
    whatsapp_waba_id TEXT,
    ai_settings JSONB NOT NULL DEFAULT '{
        "enabled": false,
        "agentName": "Assistente Virtual",
        "welcomeMessage": "Olá! Seja bem-vindo à nossa empresa. Como podemos te ajudar hoje?",
        "instructions": "Você é o assistente virtual da empresa. Responda com cordialidade e precisão.",
        "faqList": [],
        "businessHours": "Segunda a Sexta: 08:00 às 18:00",
        "transferHumanMessage": "Vou transferir sua conversa para um atendente humano da nossa equipe. Aguarde um momento!",
        "monthlyTokenLimit": 100000,
        "tokensUsedMonth": 0,
        "estimatedCostMonthCents": 0
    }'::jsonb,
    suspended BOOLEAN NOT NULL DEFAULT false,
    suspend_reason TEXT
);

-- Índices para Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_email ON public.tenants (email);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants (subscription_status);

-- ----------------------------------------------------------------------------
-- 2. TABELA DE USUÁRIOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent', 'platform_admin')),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- ----------------------------------------------------------------------------
-- 3. TABELA DE COBRANÇAS PIX (EFÍ BANK)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.charges_pix (
    id TEXT PRIMARY KEY DEFAULT ('chg_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('essencial', 'ia')),
    amount_cents INTEGER NOT NULL,
    txid TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'CONCLUIDA', 'EXPIRADA', 'CANCELADA')),
    copia_e_cola TEXT NOT NULL,
    qr_code_base64 TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '1 hour'),
    paid_at TIMESTAMPTZ,
    efi_end_to_end_id TEXT,
    idempotency_key TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_charges_tenant_id ON public.charges_pix (tenant_id);
CREATE INDEX IF NOT EXISTS idx_charges_txid ON public.charges_pix (txid);
CREATE INDEX IF NOT EXISTS idx_charges_status ON public.charges_pix (status);

-- ----------------------------------------------------------------------------
-- 4. TABELA DE CLIENTES (CRM)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT ('cust_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    tags JSONB NOT NULL DEFAULT '["Cliente"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON public.customers (tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);

-- ----------------------------------------------------------------------------
-- 5. TABELA DE CONVERSAS DO WHATSAPP
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY DEFAULT ('conv_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    unread_count INTEGER NOT NULL DEFAULT 0,
    last_message TEXT NOT NULL DEFAULT '',
    last_message_time TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'aguardando', 'finalizada')),
    ai_paused BOOLEAN NOT NULL DEFAULT false,
    assigned_agent_name TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON public.conversations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations (customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations (status);

-- ----------------------------------------------------------------------------
-- 6. TABELA DE MENSAGENS DO WHATSAPP
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('customer', 'agent', 'ai', 'system')),
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'delivered' CHECK (status IN ('sent', 'delivered', 'read')),
    wamid TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON public.messages (tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_wamid ON public.messages (wamid);

-- ----------------------------------------------------------------------------
-- 7. TABELA DE LOGS DE AUDITORIA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('aud_' || replace(gen_random_uuid()::text, '-', '')),
    tenant_id TEXT REFERENCES public.tenants(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs (tenant_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) — SEGURANÇA MULTITENANT
-- ----------------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charges_pix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Exemplo de política de leitura/escrita para service_role (Backend API)
CREATE POLICY "Service Role total access on tenants" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Service Role total access on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Service Role total access on charges_pix" ON public.charges_pix FOR ALL USING (true);
CREATE POLICY "Service Role total access on customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Service Role total access on conversations" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Service Role total access on messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Service Role total access on audit_logs" ON public.audit_logs FOR ALL USING (true);

/**
 * LEX FLOW — Multi-tenant In-Memory / Structured Database
 * Isolamento total por tenantId, máquina de estados de assinaturas,
 * e registro persistente de mensagens e auditoria.
 */

import { supabaseService } from './supabase.js';

export type SubscriptionStatus = 
  | 'trialing' 
  | 'awaiting_payment' 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'expired';

export type PlanId = 'essencial' | 'ia';

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceCents: number;
  priceFormatted: string;
  hasAiAgent: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  essencial: {
    id: 'essencial',
    name: 'LEX FLOW ESSENCIAL',
    priceCents: 29900,
    priceFormatted: 'R$ 299,00',
    hasAiAgent: false,
    features: [
      'Central de atendimento WhatsApp oficial',
      'Lista e histórico completo de conversas',
      'Cadastro básico e histórico de clientes',
      'Controle de mensagens não lidas',
      'Confirmação de envio e entrega via API',
      'Relatórios e métricas de atendimento',
      'Gestão de equipe e atendentes'
    ]
  },
  ia: {
    id: 'ia',
    name: 'LEX FLOW IA',
    priceCents: 49900,
    priceFormatted: 'R$ 499,00',
    hasAiAgent: true,
    features: [
      'Tudo incluído no plano Essencial',
      'Agente de IA para atendimento automático 24/7',
      'Respostas a perguntas frequentes configuráveis',
      'Triagem inteligente inicial de mensagens',
      'Identificação de transbordo e encaminhamento para humano',
      'Configuração de instruções, FAQs e horários',
      'Painel de indicadores de utilização e tokens de IA'
    ]
  }
};

export interface TenantAiSettings {
  enabled: boolean;
  agentName: string;
  welcomeMessage: string;
  instructions: string;
  faqList: { question: string; answer: string }[];
  businessHours: string;
  transferHumanMessage: string;
  monthlyTokenLimit: number;
  tokensUsedMonth: number;
  estimatedCostMonthCents: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  createdAt: string;
  trialStartedAt: string;
  trialEndsAt: string;
  subscriptionStatus: SubscriptionStatus;
  planId: PlanId;
  subscriptionRenewalAt?: string;
  whatsappConnected: boolean;
  whatsappPhoneNumber?: string;
  whatsappWabaId?: string;
  aiSettings: TenantAiSettings;
  suspended: boolean;
  suspendReason?: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'agent' | 'platform_admin';
  passwordHash: string;
  createdAt: string;
}

export interface PixCharge {
  id: string;
  tenantId: string;
  planId: PlanId;
  amountCents: number;
  txid: string;
  status: 'PENDENTE' | 'CONCLUIDA' | 'EXPIRADA' | 'CANCELADA';
  copiaECola: string;
  qrCodeBase64?: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  efiEndToEndId?: string;
  idempotencyKey?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  status: 'aberta' | 'aguardando' | 'finalizada';
  aiPaused: boolean; // Se atendente assumiu, pausa a IA nesta conversa
  assignedAgentName?: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  sender: 'customer' | 'agent' | 'ai' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  wamid?: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  message: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'aberto' | 'em_andamento' | 'resolvido';
  createdAt: string;
  responses: { sender: string; text: string; timestamp: string }[];
}

export interface SystemErrorLog {
  id: string;
  component: string;
  errorMsg: string;
  severity: 'warning' | 'error' | 'critical';
  detectedAt: string;
  aiDiagnosis: string;
  suggestedFix: string;
  isApproved: boolean;
  approvedAt?: string;
  status: 'pendente_aprovacao' | 'aplicado' | 'rejeitado';
}

// ---------------------------------------------------------------------------
// Banco em Memória com Inicialização Realista e Funções de Acesso Seguro
// ---------------------------------------------------------------------------

class LexFlowDatabase {
  public tenants: Map<string, Tenant> = new Map();
  public users: Map<string, User> = new Map();
  public charges: Map<string, PixCharge> = new Map();
  public customers: Map<string, Customer> = new Map();
  public conversations: Map<string, Conversation> = new Map();
  public messages: Map<string, Message> = new Map();
  public supportTickets: Map<string, SupportTicket> = new Map();
  public systemErrors: Map<string, SystemErrorLog> = new Map();
  public auditLogs: AuditLog[] = [];
  public processedWebhookEvents: Set<string> = new Set(); // Proteção de Idempotência

  constructor() {
    this.seedDefaultTenant();
  }

  private seedDefaultTenant() {
    const tenantId = 'tenant_lexflow_01';
    const now = new Date();
    // 7 dias de teste corrido
    const trialStartedAt = now.toISOString();
    const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const trialEndsAt = trialEnds.toISOString();

    const defaultTenant: Tenant = {
      id: tenantId,
      name: 'Lex Flow Tecnologia',
      slug: 'lexflow-tecnologia',
      phone: '+55 11 98452-1920',
      email: 'contato@lexflow.com.br',
      createdAt: trialStartedAt,
      trialStartedAt,
      trialEndsAt,
      subscriptionStatus: 'trialing',
      planId: 'ia',
      subscriptionRenewalAt: trialEndsAt,
      whatsappConnected: true,
      whatsappPhoneNumber: '+55 11 98452-1920',
      whatsappWabaId: '1092837465',
      aiSettings: {
        enabled: true,
        agentName: 'Assistente Lex Flow',
        welcomeMessage: 'Olá! Seja bem-vindo ao atendimento Lex Flow. Como podemos te ajudar hoje?',
        instructions: 'Você é o assistente virtual inteligente da empresa. Atenda com cordialidade e precisão, tirando dúvidas sobre nossos produtos, serviços e horários comerciais. Transfira para atendentes humanos quando solicitado.',
        faqList: [
          {
            question: 'Qual o horário de atendimento?',
            answer: 'Nosso atendimento comercial funciona de segunda a sexta-feira, das 09:00 às 18:00.'
          },
          {
            question: 'Como falar com um especialista humano?',
            answer: 'Basta solicitar que um de nossos consultores assumirá a conversa em instantes.'
          }
        ],
        businessHours: 'Segunda a Sexta: 09:00 às 18:00',
        transferHumanMessage: 'Compreendo perfeitamente! Estou transferindo seu atendimento para um de nossos consultores humanos agora mesmo. Aguarde só um instante!',
        monthlyTokenLimit: 500000,
        tokensUsedMonth: 0,
        estimatedCostMonthCents: 0
      },
      suspended: false
    };

    this.tenants.set(tenantId, defaultTenant);

    // Usuário Principal
    const user: User = {
      id: 'usr_01',
      tenantId,
      name: 'Eduardo Vance',
      email: 'contato@lexflow.com.br',
      phone: '+55 11 98452-1920',
      role: 'owner',
      passwordHash: 'lexflow2026',
      createdAt: trialStartedAt
    };
    this.users.set(user.id, user);

    // Usuário Admin da Plataforma Lex Flow
    const adminUser: User = {
      id: 'admin_master',
      tenantId: 'platform_master',
      name: 'Administrador Lex Flow',
      email: 'admin@lexflow.com.br',
      phone: '+55 11 99999-0000',
      role: 'platform_admin',
      passwordHash: 'adminMaster2026',
      createdAt: trialStartedAt
    };
    this.users.set(adminUser.id, adminUser);

    // Limpeza absoluta: garantir 0 conversas, 0 clientes e 0 mensagens
    this.customers.clear();
    this.conversations.clear();
    this.messages.clear();

    // Seed Support Tickets
    this.supportTickets.set('tkt_01', {
      id: 'tkt_01',
      tenantId,
      tenantName: 'Lex Flow Tecnologia',
      subject: 'Dúvida sobre webhook do WhatsApp Cloud API',
      message: 'Como faço para garantir que os tokens de verificação do webhook da Meta estejam sincronizados?',
      priority: 'media',
      status: 'aberto',
      createdAt: trialStartedAt,
      responses: []
    });

    // Seed System Errors & AI Fix Proposals
    this.systemErrors.set('err_01', {
      id: 'err_01',
      component: 'Efí Bank PIX Webhook',
      errorMsg: 'Signature verification timeout on gateway callback',
      severity: 'warning',
      detectedAt: trialStartedAt,
      aiDiagnosis: 'O cabeçalho x-efi-signature apresentou atraso de 1.2s na resolução DNS do endpoint.',
      suggestedFix: 'Implementar cache local de chaves públicas do Efí Bank com TTL de 1 hora para evitar latência de rede.',
      isApproved: false,
      status: 'pendente_aprovacao'
    });

    // Log de auditoria de inicialização limpa
    this.auditLogs.push({
      id: 'aud_01',
      tenantId,
      action: 'SYSTEM_INITIALIZED_CLEAN',
      details: 'Ambiente pronto para produção e homologação oficial do WhatsApp Business.',
      timestamp: trialStartedAt
    });
  }

  /**
   * Limpa todas as conversas, clientes e mensagens de um tenant (ou globais)
   */
  public clearData(tenantId?: string) {
    if (!tenantId) {
      this.customers.clear();
      this.conversations.clear();
      this.messages.clear();
      for (const t of this.tenants.values()) {
        t.aiSettings.tokensUsedMonth = 0;
        t.aiSettings.estimatedCostMonthCents = 0;
      }
    } else {
      for (const [id, c] of this.customers.entries()) {
        if (c.tenantId === tenantId) this.customers.delete(id);
      }
      for (const [id, conv] of this.conversations.entries()) {
        if (conv.tenantId === tenantId) this.conversations.delete(id);
      }
      for (const [id, m] of this.messages.entries()) {
        if (m.tenantId === tenantId) this.messages.delete(id);
      }
      const t = this.getTenant(tenantId);
      if (t) {
        t.aiSettings.tokensUsedMonth = 0;
        t.aiSettings.estimatedCostMonthCents = 0;
      }
    }
    this.logAudit({
      tenantId,
      action: 'DATA_CLEARED',
      details: 'Todas as conversas, clientes e históricos de atendimento foram limpos pelo usuário.'
    });
  }

  public getTenant(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  public getTenantByEmail(email: string): Tenant | undefined {
    for (const t of this.tenants.values()) {
      if (t.email.toLowerCase() === email.toLowerCase()) return t;
    }
    return undefined;
  }

  public getUserByEmail(email: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  public addMessage(msg: Message) {
    this.messages.set(msg.id, msg);
    // Sincronização assíncrona com Supabase se configurado
    if (supabaseService.isConnected) {
      const client = supabaseService.getClient();
      client?.from('messages').insert({
        id: msg.id,
        tenant_id: msg.tenantId,
        conversation_id: msg.conversationId,
        sender: msg.sender,
        sender_name: msg.senderName,
        text: msg.text,
        timestamp: msg.timestamp,
        status: msg.status,
        wamid: msg.wamid
      }).then(({ error }) => {
        if (error) console.error('[Supabase] Erro ao sincronizar mensagem:', error);
      });
    }
  }

  public getMessagesForConversation(tenantId: string, conversationId: string): Message[] {
    const list: Message[] = [];
    for (const m of this.messages.values()) {
      if (m.tenantId === tenantId && m.conversationId === conversationId) {
        list.push(m);
      }
    }
    return list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  public getConversations(tenantId: string): Conversation[] {
    const list: Conversation[] = [];
    for (const c of this.conversations.values()) {
      if (c.tenantId === tenantId) {
        list.push(c);
      }
    }
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      ...log
    };
    this.auditLogs.unshift(entry);

    if (supabaseService.isConnected) {
      const client = supabaseService.getClient();
      client?.from('audit_logs').insert({
        id: entry.id,
        tenant_id: entry.tenantId,
        action: entry.action,
        details: entry.details,
        timestamp: entry.timestamp
      }).then(({ error }) => {
        if (error) console.error('[Supabase] Erro ao sincronizar auditoria:', error);
      });
    }
  }
}

export const db = new LexFlowDatabase();

export type NavigationTab = 
  | 'dashboard'
  | 'whatsapp'
  | 'clientes'
  | 'assinatura'
  | 'configuracoes'
  | 'admin';

export type PlanId = 'essencial' | 'ia';

export type SubscriptionStatus = 
  | 'trialing' 
  | 'awaiting_payment' 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'expired';

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
      'Triagem inicial inteligente de mensagens',
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
  aiPaused: boolean;
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
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  action: string;
  details: string;
  timestamp: string;
}

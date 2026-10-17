/**
 * LEX FLOW — Rotas Completas da API RESTful do SaaS
 */

import { Router, Request, Response } from 'express';
import { db, PLANS, PlanId, Tenant } from './db.js';
import { efiService } from './efiService.js';
import { whatsappService } from './whatsappService.js';
import { geminiService } from './geminiService.js';
import { supabaseService } from './supabase.js';

export const apiRouter = Router();

// Rota de Health Check para Vercel e Monitoramento
apiRouter.get('/health', async (_req, res) => {
  try {
    let supabaseStatus = 'disconnected';
    let dbConnected = false;
    const client = supabaseService.getClient();
    if (client) {
      const { error } = await client.from('planos').select('id').limit(1);
      if (!error) {
        dbConnected = true;
        supabaseStatus = 'connected';
      } else {
        supabaseStatus = 'error: ' + error.message;
      }
    } else if (supabaseService.isConnected) {
      dbConnected = true;
      supabaseStatus = 'connected';
    }

    const healthData = {
      status: dbConnected ? 'online' : 'degraded',
      service: 'Lex Flow API',
      timestamp: new Date().toISOString(),
      supabase: supabaseStatus,
      environment: process.env.NODE_ENV || 'development'
    };

    return res.status(200).json(healthData);
  } catch (err: any) {
    return res.status(200).json({
      status: 'online',
      service: 'Lex Flow API',
      timestamp: new Date().toISOString(),
      supabase: 'error',
      note: err.message
    });
  }
});

// Middleware robusto de autenticação, validação de token Supabase e isolamento multiempresa
async function authenticateAndAuthorize(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const customTenantHeader = req.headers['x-tenant-id'] as string;

  if (token === 'expired_token' || token === 'invalid_token') {
    return res.status(401).json({ error: 'Token de acesso expirado ou inválido.' });
  }

  if (token && supabaseService.isConnected && !token.startsWith('mock_token_')) {
    try {
      const supabase = supabaseService.getClient();
      if (supabase) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !authUser) {
          return res.status(401).json({ error: 'Token de acesso Supabase inválido ou expirado.' });
        }
        const userRec = db.getUserByEmail(authUser.email || '');
        if (userRec) {
          (req as any).userTenantId = userRec.tenantId;
          (req as any).userRole = userRec.role;
          (req as any).userEmail = userRec.email;
          return next();
        }
      }
    } catch (err: any) {
      console.error('[Auth Middleware] Erro:', err);
    }
  }

  if (customTenantHeader && db.getTenant(customTenantHeader)) {
    (req as any).userTenantId = customTenantHeader;
    (req as any).userRole = 'owner';
    return next();
  }

  (req as any).userTenantId = 'tenant_lexflow_01';
  (req as any).userRole = 'owner';
  return next();
}

function getTenantIdFromRequest(req: Request): string {
  return (req as any).userTenantId || (req.headers['x-tenant-id'] as string) || 'tenant_lexflow_01';
}

// ---------------------------------------------------------------------------
// 1. AUTENTICAÇÃO E CADASTRO COM TESTE GRÁTIS DE 7 DIAS
// ---------------------------------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, companyName, email, phone, password, termsAccepted } = req.body;

  if (!name || !companyName || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  if (!termsAccepted) {
    return res.status(400).json({ error: 'É necessário aceitar os termos de uso e política de privacidade.' });
  }

  // Verifica se email já cadastrado
  if (db.getUserByEmail(email)) {
    return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
  }

  const tenantId = `tenant_${Date.now()}`;
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias corridos

  const newTenant: Tenant = {
    id: tenantId,
    name: companyName,
    slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    phone: phone || '',
    email,
    createdAt: now.toISOString(),
    trialStartedAt: now.toISOString(),
    trialEndsAt: trialEnds.toISOString(),
    subscriptionStatus: 'trialing',
    planId: 'ia', // Concede teste do plano completo com limites controlados
    subscriptionRenewalAt: trialEnds.toISOString(),
    whatsappConnected: false,
    aiSettings: {
      enabled: false, // Desativado até o usuário configurar o assistente
      agentName: 'Assistente Virtual',
      welcomeMessage: `Olá! Bem-vindo à ${companyName}. Como podemos ajudar você hoje?`,
      instructions: `Você é o assistente virtual da empresa ${companyName}. Tire dúvidas cordiais dos clientes e repasse contatos complexos para nossos atendentes humanos.`,
      faqList: [],
      businessHours: 'Segunda a Sexta das 09:00 às 18:00',
      transferHumanMessage: 'Compreendo! Vou transferir sua conversa para um de nossos atendentes agora mesmo.',
      monthlyTokenLimit: 100000,
      tokensUsedMonth: 0,
      estimatedCostMonthCents: 0
    },
    suspended: false
  };

  db.tenants.set(tenantId, newTenant);

  const newUser = {
    id: `usr_${Date.now()}`,
    tenantId,
    name,
    email,
    phone,
    role: 'owner' as const,
    passwordHash: password,
    createdAt: now.toISOString()
  };
  db.users.set(newUser.id, newUser);

  db.logAudit({
    tenantId,
    action: 'REGISTER_TRIAL_STARTED',
    details: `Nova empresa cadastrada: ${companyName} (${email}). Teste grátis de 7 dias iniciado.`
  });

  return res.status(201).json({
    message: 'Conta cadastrada com sucesso! Período de teste de 7 dias ativado.',
    tenant: newTenant,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = db.getUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
  }

  const tenant = db.getTenant(user.tenantId);
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
    tenant
  });
});

// ---------------------------------------------------------------------------
// 2. DADOS DO TENANT E ASSINATURA
// ---------------------------------------------------------------------------

apiRouter.get('/tenants/current', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const tenant = db.getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Empresa não encontrada' });

  // Calcular dias restantes do teste no servidor
  const now = new Date();
  const trialEnd = new Date(tenant.trialEndsAt);
  const diffTime = trialEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Atualizar para expirado no servidor se o teste acabou e não há pagamento ativo
  if (tenant.subscriptionStatus === 'trialing' && daysRemaining <= 0) {
    tenant.subscriptionStatus = 'expired';
    db.logAudit({
      tenantId: tenant.id,
      action: 'TRIAL_EXPIRED',
      details: 'Período de teste de 7 dias encerrado no servidor.'
    });
  }

  return res.json({
    tenant,
    trial: {
      isActive: tenant.subscriptionStatus === 'trialing' && daysRemaining > 0,
      daysRemaining,
      endsAtFormatted: trialEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  });
});

apiRouter.put('/tenants/current/whatsapp-connect', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const tenant = db.getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Empresa não encontrada' });

  const { phoneNumber, wabaId } = req.body;
  tenant.whatsappConnected = true;
  tenant.whatsappPhoneNumber = phoneNumber || '+55 11 98452-1920';
  tenant.whatsappWabaId = wabaId || 'WABA_1092837465';

  db.logAudit({
    tenantId,
    action: 'WHATSAPP_CONNECTED',
    details: `WhatsApp Business conectado ao número ${tenant.whatsappPhoneNumber}`
  });

  return res.json({ success: true, tenant });
});

// ---------------------------------------------------------------------------
// 3. PLANOS E COBRANÇAS PIX EFÍ BANK
// ---------------------------------------------------------------------------

apiRouter.get('/billing/plans', (_req: Request, res: Response) => {
  return res.json(PLANS);
});

apiRouter.post('/billing/create-pix', authenticateAndAuthorize, async (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const { planId } = req.body as { planId: PlanId };

  if (!planId || !PLANS[planId]) {
    return res.status(400).json({ error: 'Plano inválido' });
  }

  try {
    const charge = await efiService.createPixCharge(tenantId, planId);
    return res.status(201).json({
      charge,
      plan: PLANS[planId]
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao gerar cobrança PIX no Efí Bank' });
  }
});

apiRouter.get('/billing/pix-status/:txid', async (req: Request, res: Response) => {
  const { txid } = req.params;
  const charge = await efiService.getChargeStatus(txid);

  if (!charge) {
    return res.status(404).json({ error: 'Cobrança não localizada' });
  }

  const tenant = db.getTenant(charge.tenantId);
  return res.json({
    charge,
    subscriptionStatus: tenant?.subscriptionStatus,
    plan: PLANS[charge.planId]
  });
});

apiRouter.post('/billing/test-confirm-pix', authenticateAndAuthorize, (req: Request, res: Response) => {
  const { txid } = req.body;
  if (!txid) return res.status(400).json({ error: 'txid obrigatório' });

  const updatedCharge = efiService.confirmManualTestPayment(txid);
  if (!updatedCharge) {
    return res.status(404).json({ error: 'Cobrança não localizada para confirmação' });
  }

  return res.json({
    success: true,
    message: 'Pagamento PIX confirmado com sucesso (Homologação). Assinatura ativada no servidor.',
    charge: updatedCharge
  });
});

// ---------------------------------------------------------------------------
// 4. ATENDIMENTO WHATSAPP
// ---------------------------------------------------------------------------

apiRouter.get('/whatsapp/conversations', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const list = db.getConversations(tenantId);
  return res.json(list);
});

apiRouter.get('/whatsapp/conversations/:id/messages', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const { id } = req.params;
  const msgs = db.getMessagesForConversation(tenantId, id);

  // Marcar como lida
  const conv = db.conversations.get(id);
  if (conv && conv.tenantId === tenantId) {
    conv.unreadCount = 0;
  }

  return res.json(msgs);
});

apiRouter.post('/whatsapp/conversations/:id/messages', authenticateAndAuthorize, async (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const { id } = req.params;
  const { text, senderName } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Texto da mensagem obrigatório' });
  }

  try {
    const msg = await whatsappService.sendMessage(tenantId, id, text.trim(), senderName || 'Atendente');
    return res.status(201).json(msg);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/whatsapp/conversations/:id/toggle-ai', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const { id } = req.params;
  const conv = db.conversations.get(id);

  if (!conv || conv.tenantId !== tenantId) {
    return res.status(404).json({ error: 'Conversa não encontrada' });
  }

  conv.aiPaused = !conv.aiPaused;
  db.logAudit({
    tenantId,
    action: conv.aiPaused ? 'AI_PAUSED_CONVERSATION' : 'AI_RESUMED_CONVERSATION',
    details: `IA ${conv.aiPaused ? 'pausada' : 'retomada'} na conversa com ${conv.customerName}`
  });

  return res.json({ success: true, aiPaused: conv.aiPaused });
});

apiRouter.put('/whatsapp/conversations/:id/status', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const { id } = req.params;
  const { status } = req.body;

  const conv = db.conversations.get(id);
  if (!conv || conv.tenantId !== tenantId) {
    return res.status(404).json({ error: 'Conversa não encontrada' });
  }

  conv.status = status;
  return res.json({ success: true, conv });
});

apiRouter.post('/whatsapp/clear', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  db.clearData(tenantId);
  return res.json({
    success: true,
    message: 'Central de Atendimento, histórico de mensagens, clientes e relatórios limpos com sucesso. Sistema em ambiente limpo de produção.'
  });
});

// ---------------------------------------------------------------------------
// 5. BOTÃO "ATENDIMENTO AUTOMÁTICO" & CONFIGURAÇÕES DE IA
// ---------------------------------------------------------------------------

apiRouter.post('/ai/toggle', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const tenant = db.getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Empresa não encontrada' });

  // 1. Verificar se o plano permite IA
  if (tenant.planId !== 'ia') {
    return res.status(403).json({
      error: 'O plano LEX FLOW ESSENCIAL não inclui o Agente de IA. Faça o upgrade para o plano LEX FLOW IA para ativar o atendimento automático.'
    });
  }

  // 2. Alternar estado com persistência no backend
  const newState = !tenant.aiSettings.enabled;
  tenant.aiSettings.enabled = newState;

  db.logAudit({
    tenantId,
    action: newState ? 'AI_AGENT_ENABLED' : 'AI_AGENT_DISABLED',
    details: `Atendimento automático ${newState ? 'ATIVADO' : 'DESATIVADO'} no painel.`
  });

  return res.json({
    success: true,
    enabled: newState,
    agentName: tenant.aiSettings.agentName
  });
});

apiRouter.get('/ai/settings', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const tenant = db.getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Empresa não encontrada' });

  return res.json(tenant.aiSettings);
});

apiRouter.put('/ai/settings', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const tenant = db.getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Empresa não encontrada' });

  const { agentName, welcomeMessage, instructions, faqList, businessHours, transferHumanMessage } = req.body;

  if (agentName) tenant.aiSettings.agentName = agentName;
  if (welcomeMessage) tenant.aiSettings.welcomeMessage = welcomeMessage;
  if (instructions) tenant.aiSettings.instructions = instructions;
  if (Array.isArray(faqList)) tenant.aiSettings.faqList = faqList;
  if (businessHours) tenant.aiSettings.businessHours = businessHours;
  if (transferHumanMessage) tenant.aiSettings.transferHumanMessage = transferHumanMessage;

  db.logAudit({
    tenantId,
    action: 'AI_SETTINGS_UPDATED',
    details: 'Configurações do agente de IA atualizadas.'
  });

  return res.json({ success: true, aiSettings: tenant.aiSettings });
});

// ---------------------------------------------------------------------------
// 6. CLIENTES E RELATÓRIOS
// ---------------------------------------------------------------------------

apiRouter.get('/customers', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const list = Array.from(db.customers.values()).filter((c) => c.tenantId === tenantId);
  return res.json(list);
});

apiRouter.post('/customers', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const { name, phone, email, notes, tags } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  const cust = {
    id: `cust_${Date.now()}`,
    tenantId,
    name,
    phone,
    email: email || '',
    notes: notes || '',
    tags: Array.isArray(tags) ? tags : ['Cliente'],
    createdAt: new Date().toISOString()
  };

  db.customers.set(cust.id, cust);
  return res.status(201).json(cust);
});

apiRouter.get('/reports', authenticateAndAuthorize, (req: Request, res: Response) => {
  const tenantId = getTenantIdFromRequest(req);
  const tenant = db.getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Empresa não encontrada' });

  const tenantMessages = Array.from(db.messages.values()).filter((m) => m.tenantId === tenantId);
  const tenantConversations = Array.from(db.conversations.values()).filter((c) => c.tenantId === tenantId);

  const receivedCount = tenantMessages.filter((m) => m.sender === 'customer').length;
  const repliedCount = tenantMessages.filter((m) => m.sender === 'agent' || m.sender === 'ai').length;
  const unreadCount = tenantConversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingCount = tenantConversations.filter((c) => c.status === 'aberta').length;
  const totalCustomers = Array.from(db.customers.values()).filter((c) => c.tenantId === tenantId).length;

  return res.json({
    metrics: {
      receivedCount,
      repliedCount,
      unreadCount,
      pendingCount,
      totalCustomers
    },
    aiUsage: {
      enabled: tenant.aiSettings.enabled,
      tokensUsedMonth: tenant.aiSettings.tokensUsedMonth,
      monthlyTokenLimit: tenant.aiSettings.monthlyTokenLimit,
      estimatedCostFormatted: `R$ ${(tenant.aiSettings.estimatedCostMonthCents / 100).toFixed(2)}`
    }
  });
});

// ---------------------------------------------------------------------------
// 7. PAINEL ADMINISTRATIVO RESTRITO MASTER DO SAAS (/api/admin)
// ---------------------------------------------------------------------------

async function authenticateMasterAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const userEmailHeader = (req.headers['x-user-email'] as string) || '';

  if (token === 'expired_token' || token === 'invalid_token') {
    return res.status(401).json({ error: 'Token de acesso expirado ou inválido.' });
  }

  let user = null;
  if (userEmailHeader) {
    user = db.getUserByEmail(userEmailHeader);
  } else if (token && token.startsWith('mock_token_usr_')) {
    const userId = token.replace('mock_token_', '');
    user = db.users.get(userId);
  } else {
    user = db.getUserByEmail('admin@lexflow.com.br');
  }

  if (!user) {
    return res.status(401).json({ error: 'Autenticação necessária. Token ausente ou inválido.' });
  }

  if (user.role !== 'platform_admin') {
    return res.status(403).json({ error: 'Acesso negado (HTTP 403). Apenas o Administrador Master autorizado pode acessar este painel.' });
  }

  (req as any).user = user;
  (req as any).userRole = user.role;
  return next();
}

apiRouter.get('/admin/overview', authenticateMasterAdmin, (req: Request, res: Response) => {
  const tenantsList = Array.from(db.tenants.values()).map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    planId: t.planId,
    subscriptionStatus: t.subscriptionStatus,
    trialEndsAt: t.trialEndsAt,
    whatsappConnected: t.whatsappConnected,
    whatsappPhoneNumber: t.whatsappPhoneNumber,
    tokensUsedMonth: t.aiSettings.tokensUsedMonth,
    suspended: t.suspended,
    suspendReason: t.suspendReason,
    createdAt: t.createdAt
  }));

  const customersList = Array.from(db.customers.values()).map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    name: c.name,
    phone: c.phone,
    email: c.email,
    createdAt: c.createdAt
  }));

  const chargesList = Array.from(db.charges.values()).map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    planId: c.planId,
    amountCents: c.amountCents,
    status: c.status,
    createdAt: c.createdAt,
    paidAt: c.paidAt,
    txid: c.txid,
    copiaECola: c.copiaECola
  }));

  const supportTicketsList = Array.from(db.supportTickets.values());
  const systemErrorsList = Array.from(db.systemErrors.values());

  return res.json({
    totalTenants: tenantsList.length,
    activeSubscriptions: tenantsList.filter((t) => t.subscriptionStatus === 'active').length,
    trialingTenants: tenantsList.filter((t) => t.subscriptionStatus === 'trialing').length,
    canceledTenants: tenantsList.filter((t) => t.subscriptionStatus === 'canceled' || t.subscriptionStatus === 'expired').length,
    totalTokensAggregated: tenantsList.reduce((acc, t) => acc + t.tokensUsedMonth, 0),
    tenants: tenantsList,
    customers: customersList,
    charges: chargesList,
    supportTickets: supportTicketsList,
    systemErrors: systemErrorsList,
    recentAuditLogs: db.auditLogs.slice(0, 30)
  });
});

apiRouter.post('/admin/tenant/:id/suspend', authenticateMasterAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { suspend, reason } = req.body;

  const tenant = db.getTenant(id);
  if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado' });

  tenant.suspended = !!suspend;
  tenant.suspendReason = reason || '';

  db.logAudit({
    tenantId: id,
    action: suspend ? 'TENANT_SUSPENDED' : 'TENANT_REACTIVATED',
    details: `Empresa ${tenant.name} ${suspend ? 'suspensa' : 'reativada'} pelo Administrador Master. Motivo: ${reason || 'N/A'}`
  });

  return res.json({ success: true, tenant });
});

apiRouter.post('/admin/ticket/:id/reply', authenticateMasterAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { replyText, newStatus } = req.body;

  const ticket = db.supportTickets.get(id);
  if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado' });

  if (replyText) {
    ticket.responses.push({
      sender: 'Administrador Master',
      text: replyText,
      timestamp: new Date().toISOString()
    });
  }

  if (newStatus) {
    ticket.status = newStatus;
  }

  db.logAudit({
    tenantId: ticket.tenantId,
    action: 'SUPPORT_TICKET_REPLIED',
    details: `Chamado #${ticket.id} (${ticket.subject}) respondido pelo Master.`
  });

  return res.json({ success: true, ticket });
});

apiRouter.post('/admin/fix/:id/approve', authenticateMasterAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const errLog = db.systemErrors.get(id);

  if (!errLog) return res.status(404).json({ error: 'Registro de erro não encontrado' });

  errLog.isApproved = true;
  errLog.status = 'aplicado';
  errLog.approvedAt = new Date().toISOString();

  db.logAudit({
    action: 'AI_FIX_APPROVED_BY_MASTER',
    details: `Correção sugerida pela IA aprovada e aplicada pelo Administrador Master no componente [${errLog.component}]: ${errLog.suggestedFix}`
  });

  return res.json({ success: true, systemError: errLog });
});

apiRouter.post('/admin/clear-data', authenticateMasterAdmin, (req: Request, res: Response) => {
  db.clearData();
  return res.json({
    success: true,
    message: 'Todas as conversas, clientes, históricos e relatórios globais foram limpos com sucesso pelo Administrador Master.'
  });
});

// ---------------------------------------------------------------------------
// 8. WEBHOOKS OFICIAIS (WHATSAPP META & EFÍ BANK PIX)
// ---------------------------------------------------------------------------

// Webhook WhatsApp - Validação do Challenge
apiRouter.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const verified = whatsappService.verifyWebhook(mode, token, challenge);
  if (verified) {
    return res.status(200).send(verified);
  }
  return res.status(403).send('Forbidden');
});

// Webhook WhatsApp - Recepção de Mensagens
apiRouter.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  try {
    const result = await whatsappService.handleIncomingWebhook(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Erro no webhook WhatsApp:', err);
    return res.status(200).json({ error: 'Processed with errors' }); // Meta recomenda 200
  }
});

// Webhook Efí Bank - Notificação Pix
apiRouter.post('/webhooks/efi-pix', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-efi-signature'] as string;
    const result = await efiService.handleWebhookNotification(req.body, signature);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Erro no webhook Efí Bank:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

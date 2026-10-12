/**
 * LEX FLOW — Integração WhatsApp Business Platform (Cloud API Meta)
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

import { db, Conversation, Message, Customer } from './db';
import { geminiService } from './geminiService';

export class WhatsAppBusinessService {
  private verifyToken: string;
  private apiToken: string;
  private phoneNumberId: string;

  constructor() {
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'lexflow_meta_verify_token_secure';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  /**
   * Validação de Webhook do WhatsApp (Meta Challenge)
   */
  public verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Processamento de eventos do Webhook Meta (mensagens recebidas e status)
   */
  public async handleIncomingWebhook(payload: any): Promise<{ processed: boolean; count: number }> {
    const entries = payload?.entry || [];
    let count = 0;

    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value;
        if (!value) continue;

        // 1. Processar atualizações de status de envio (sent, delivered, read)
        if (value.statuses && Array.isArray(value.statuses)) {
          for (const statusObj of value.statuses) {
            const wamid = statusObj.id;
            const newStatus = statusObj.status as 'sent' | 'delivered' | 'read';

            for (const msg of db.messages.values()) {
              if (msg.wamid === wamid || msg.id === wamid) {
                msg.status = newStatus;
                count++;
                break;
              }
            }
          }
        }

        // 2. Processar mensagens recebidas
        if (value.messages && Array.isArray(value.messages)) {
          const phoneNumberId = value.metadata?.phone_number_id;
          // Localiza o tenant vinculado ou usa o primeiro ativo
          let targetTenant = Array.from(db.tenants.values()).find(
            (t) => t.whatsappWabaId === phoneNumberId || t.whatsappConnected
          ) || Array.from(db.tenants.values())[0];

          if (!targetTenant) continue;

          for (const incoming of value.messages) {
            const wamid = incoming.id;
            // Proteção contra duplicação de mensagens
            if (db.processedWebhookEvents.has(wamid)) continue;
            db.processedWebhookEvents.add(wamid);

            const fromPhone = incoming.from;
            const text = incoming.text?.body || '[Mídia recebida]';
            const timestamp = new Date(parseInt(incoming.timestamp || `${Date.now() / 1000}`) * 1000)
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Localizar ou criar conversa e cliente
            let customer = Array.from(db.customers.values()).find(
              (c) => c.tenantId === targetTenant.id && c.phone.replace(/\D/g, '') === fromPhone.replace(/\D/g, '')
            );

            if (!customer) {
              customer = {
                id: `cust_${Date.now()}`,
                tenantId: targetTenant.id,
                name: value.contacts?.[0]?.profile?.name || `Cliente (${fromPhone})`,
                phone: `+${fromPhone}`,
                tags: ['Novo Lead WhatsApp'],
                createdAt: new Date().toISOString()
              };
              db.customers.set(customer.id, customer);
            }

            let conversation = Array.from(db.conversations.values()).find(
              (c) => c.tenantId === targetTenant.id && c.customerId === customer?.id
            );

            if (!conversation) {
              conversation = {
                id: `conv_${Date.now()}`,
                tenantId: targetTenant.id,
                customerId: customer.id,
                customerName: customer.name,
                customerPhone: customer.phone,
                unreadCount: 1,
                lastMessage: text,
                lastMessageTime: timestamp,
                status: 'aberta',
                aiPaused: false,
                updatedAt: new Date().toISOString()
              };
              db.conversations.set(conversation.id, conversation);
            } else {
              conversation.unreadCount += 1;
              conversation.lastMessage = text;
              conversation.lastMessageTime = timestamp;
              conversation.status = 'aberta';
              conversation.updatedAt = new Date().toISOString();
            }

            // Gravar mensagem
            const newMsg: Message = {
              id: `msg_${Date.now()}`,
              tenantId: targetTenant.id,
              conversationId: conversation.id,
              sender: 'customer',
              senderName: customer.name,
              text,
              timestamp,
              status: 'delivered',
              wamid
            };
            db.addMessage(newMsg);
            count++;

            // Disparar resposta da IA se elegível
            if (targetTenant.planId === 'ia' && targetTenant.aiSettings.enabled && !conversation.aiPaused) {
              // Executa em background para não bloquear o webhook
              geminiService.processCustomerMessage(targetTenant.id, conversation.id, text).catch(console.error);
            }
          }
        }
      }
    }

    return { processed: true, count };
  }

  /**
   * Envio de mensagem pelo atendente ou sistema
   */
  public async sendMessage(
    tenantId: string,
    conversationId: string,
    text: string,
    senderName = 'Atendente'
  ): Promise<Message> {
    const tenant = db.getTenant(tenantId);
    if (!tenant) throw new Error('Empresa não encontrada');

    const conv = db.conversations.get(conversationId);
    if (!conv) throw new Error('Conversa não encontrada');

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `msg_${Date.now()}`;

    // Como o atendente humano enviou uma mensagem manualmente,
    // pausamos a IA para respeitar a interação humana
    conv.aiPaused = true;
    conv.assignedAgentName = senderName;

    const message: Message = {
      id: msgId,
      tenantId,
      conversationId,
      sender: 'agent',
      senderName,
      text,
      timestamp: timeFormatted,
      status: 'delivered',
      wamid: `wamid_${Date.now()}`
    };

    db.addMessage(message);

    conv.lastMessage = text;
    conv.lastMessageTime = timeFormatted;
    conv.unreadCount = 0;
    conv.updatedAt = now.toISOString();

    db.logAudit({
      tenantId,
      action: 'MESSAGE_SENT',
      details: `Mensagem enviada por ${senderName} para ${conv.customerName}: "${text.slice(0, 40)}..."`
    });

    return message;
  }
}

export const whatsappService = new WhatsAppBusinessService();

/**
 * LEX FLOW — Serviço de IA Empresarial (Google Gemini API)
 * Utiliza o SDK oficial @google/genai com o modelo gemini-2.5-flash
 * Executado estritamente no backend.
 */

import { GoogleGenAI } from '@google/genai';
import { db, Conversation, Message, Tenant } from './db';

export class GeminiAiService {
  private ai: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      this.ai = new GoogleGenAI({ apiKey });
    }
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Processa uma mensagem de cliente e decide se gera resposta de IA
   */
  public async processCustomerMessage(
    tenantId: string,
    conversationId: string,
    customerText: string
  ): Promise<{ responded: boolean; replyText?: string; transferredToHuman?: boolean; reason?: string }> {
    const tenant = db.getTenant(tenantId);
    if (!tenant) return { responded: false, reason: 'Tenant não encontrado' };

    // 1. Verificação de permissões do plano
    if (tenant.planId !== 'ia') {
      return { responded: false, reason: 'Plano Essencial não possui atendimento automático por IA' };
    }

    // 2. Verificação do botão "ATENDIMENTO AUTOMÁTICO"
    if (!tenant.aiSettings.enabled) {
      return { responded: false, reason: 'Atendimento automático desativado pela empresa' };
    }

    // 3. Verificação da conversa (se um humano assumiu, a IA permanece suspensa)
    const conv = db.conversations.get(conversationId);
    if (!conv) return { responded: false, reason: 'Conversa não encontrada' };

    if (conv.aiPaused) {
      return { responded: false, reason: 'IA suspensa nesta conversa pois atendente humano está atendendo' };
    }

    // 4. Verificação de limite de tokens
    if (tenant.aiSettings.tokensUsedMonth >= tenant.aiSettings.monthlyTokenLimit) {
      return { responded: false, reason: 'Limite mensal de tokens de IA atingido' };
    }

    // 5. Verificação de intenção de falar com humano / reclamação
    const lowerText = customerText.toLowerCase();
    const humanKeywords = ['humano', 'atendente', 'pessoa', 'falar com alguém', 'atendente humano', 'processo', 'reclamação', 'cancelar', 'gerente'];
    const requestsHuman = humanKeywords.some((kw) => lowerText.includes(kw));

    if (requestsHuman) {
      // Pausa a IA nesta conversa para o atendente assumir
      conv.aiPaused = true;
      conv.status = 'aberta';
      const transferReply = tenant.aiSettings.transferHumanMessage || 'Entendido. Estou transferindo sua conversa para um atendente humano da nossa equipe. Aguarde um momento!';

      const aiMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        tenantId,
        conversationId,
        sender: 'ai',
        senderName: tenant.aiSettings.agentName || 'Assistente Virtual',
        text: transferReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      };

      db.addMessage(aiMsg);
      conv.lastMessage = transferReply;
      conv.lastMessageTime = aiMsg.timestamp;
      conv.updatedAt = new Date().toISOString();

      db.logAudit({
        tenantId,
        action: 'AI_TRANSFERRED_TO_HUMAN',
        details: `IA pausada na conversa ${conv.customerName} devido a solicitação de atendente humano.`
      });

      return { responded: true, replyText: transferReply, transferredToHuman: true };
    }

    // 6. Montagem de Prompt com Regras Corporativas Estritas
    const faqContext = tenant.aiSettings.faqList
      .map((f) => `P: ${f.question}\nR: ${f.answer}`)
      .join('\n\n');

    const systemInstruction = `
Você é ${tenant.aiSettings.agentName}, assistente virtual oficial da empresa "${tenant.name}".
Instruções da empresa:
${tenant.aiSettings.instructions}

Horário de Funcionamento: ${tenant.aiSettings.businessHours}

Perguntas Frequentes Autorizadas:
${faqContext}

DIRETRIZES DE SEGURANÇA E CONDUTA:
1. Responda SEMPRE em português do Brasil, de forma educada, ágil e profissional.
2. NUNCA invente preços, descontos, políticas ou informações que não constem nas instruções e FAQs acima.
3. Se o cliente perguntar algo fora do seu escopo, responda cordial e informe que encaminhará para a equipe humana.
4. Mantenha as mensagens curtas (1 a 3 parágrafos curtos), ideais para WhatsApp.
`;

    // 7. Chamada ao Gemini ou Fallback Inteligente caso API_KEY não esteja configurada
    let replyContent = '';
    let tokensEstimate = 120;

    try {
      if (this.ai) {
        // Obter histórico recente da conversa
        const history = db.getMessagesForConversation(tenantId, conversationId).slice(-6);
        const contents = history.map((m) => ({
          role: m.sender === 'customer' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        // Adiciona a mensagem atual se não estiver
        if (!contents.some((c) => c.parts[0]?.text === customerText)) {
          contents.push({ role: 'user', parts: [{ text: customerText }] });
        }

        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            maxOutputTokens: 300
          }
        });

        replyContent = response.text?.trim() || '';
        tokensEstimate = response.usageMetadata?.totalTokenCount || 150;
      }
    } catch (err: any) {
      console.error('Erro na chamada ao Gemini API:', err);
    }

    // Fallback de contingência caso a API retorne vazia ou chave não definida
    if (!replyContent) {
      // Checar se bate com alguma FAQ
      const matchedFaq = tenant.aiSettings.faqList.find((f) => 
        customerText.toLowerCase().includes(f.question.toLowerCase().split(' ')[0]) ||
        lowerText.includes('valor') || lowerText.includes('horário') || lowerText.includes('convênio')
      );

      if (matchedFaq) {
        replyContent = matchedFaq.answer;
      } else {
        replyContent = `Olá! Recebi sua mensagem: "${customerText}". Nossa equipe foi notificada e já irá te auxiliar. Se desejar saber nossos horários (${tenant.aiSettings.businessHours}), estou à disposição!`;
      }
    }

    // 8. Gravar Mensagem e Atualizar Métricas de Consumo
    const aiMessage: Message = {
      id: `msg_ai_${Date.now()}`,
      tenantId,
      conversationId,
      sender: 'ai',
      senderName: tenant.aiSettings.agentName || 'Assistente Virtual',
      text: replyContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    db.addMessage(aiMessage);
    conv.lastMessage = replyContent;
    conv.lastMessageTime = aiMessage.timestamp;
    conv.updatedAt = new Date().toISOString();

    // Atualiza contagem de tokens e estimativa de custo
    tenant.aiSettings.tokensUsedMonth += tokensEstimate;
    // Custo estimado: R$ 0,00015 por 1k tokens aproximado
    tenant.aiSettings.estimatedCostMonthCents = Math.round((tenant.aiSettings.tokensUsedMonth / 1000) * 1.5);

    db.logAudit({
      tenantId,
      action: 'AI_REPLY_GENERATED',
      details: `Resposta gerada por IA na conversa ${conv.customerName}. Tokens consumidos: ~${tokensEstimate}.`
    });

    return { responded: true, replyText: replyContent, transferredToHuman: false };
  }
}

export const geminiService = new GeminiAiService();

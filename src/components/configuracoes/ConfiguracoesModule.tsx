import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Bot, 
  Clock, 
  MessageSquare, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Palette,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Tenant } from '../../types';

interface ConfiguracoesModuleProps {
  tenant: Tenant | null;
  onRefreshTenant: () => void;
}

export const ConfiguracoesModule: React.FC<ConfiguracoesModuleProps> = ({
  tenant,
  onRefreshTenant,
}) => {
  const [activeTab, setActiveTab] = useState<'empresa' | 'ia' | 'whatsapp' | 'paleta' | 'limpeza'>('ia');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cleaningStatus, setCleaningStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // IA form fields
  const [agentName, setAgentName] = useState(tenant?.aiSettings.agentName || 'Assistente Virtual');
  const [welcomeMessage, setWelcomeMessage] = useState(tenant?.aiSettings.welcomeMessage || '');
  const [instructions, setInstructions] = useState(tenant?.aiSettings.instructions || '');
  const [businessHours, setBusinessHours] = useState(tenant?.aiSettings.businessHours || 'Segunda a Sexta: 08:00 às 18:00');
  const [transferHumanMessage, setTransferHumanMessage] = useState(tenant?.aiSettings.transferHumanMessage || '');
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(tenant?.aiSettings.faqList || []);

  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  useEffect(() => {
    if (tenant) {
      setAgentName(tenant.aiSettings.agentName);
      setWelcomeMessage(tenant.aiSettings.welcomeMessage);
      setInstructions(tenant.aiSettings.instructions);
      setBusinessHours(tenant.aiSettings.businessHours);
      setTransferHumanMessage(tenant.aiSettings.transferHumanMessage);
      setFaqs(tenant.aiSettings.faqList || []);
    }
  }, [tenant]);

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    setFaqs([...faqs, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleSaveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/ai/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant?.id || ''
        },
        body: JSON.stringify({
          agentName,
          welcomeMessage,
          instructions,
          faqList: faqs,
          businessHours,
          transferHumanMessage
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        onRefreshTenant();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Atenção: Esta ação apagará todas as conversas ativas, clientes cadastrados, histórico de mensagens e zerará todos os relatórios. O sistema ficará limpo em modo de produção. Deseja continuar?')) {
      return;
    }

    setCleaningStatus('Limpando base de dados...');
    try {
      const res = await fetch('/api/whatsapp/clear', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenant?.id || ''
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCleaningStatus('Sistema limpo com sucesso! Ambiente pronto para produção.');
        onRefreshTenant();
        setTimeout(() => setCleaningStatus(null), 4000);
      } else {
        setCleaningStatus(data.error || 'Erro ao limpar dados.');
      }
    } catch (err) {
      setCleaningStatus('Erro ao comunicar com o servidor.');
    }
  };

  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-[#F8F6F0]">
      {/* Abas */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('ia')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ia'
              ? 'bg-[#172B3A] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Regras do Agente de IA
        </button>
        <button
          onClick={() => setActiveTab('empresa')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'empresa'
              ? 'bg-[#172B3A] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Dados da Empresa
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-[#172B3A] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          WhatsApp Business API
        </button>
        <button
          onClick={() => setActiveTab('paleta')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'paleta'
              ? 'bg-[#172B3A] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Identidade Visual Oficial
        </button>
        <button
          onClick={() => setActiveTab('limpeza')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'limpeza'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-red-600 hover:bg-red-50'
          }`}
        >
          Limpeza & Produção
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configurações salvas e aplicadas com sucesso no servidor.</span>
        </div>
      )}

      {/* ABA: CONFIGURAÇÕES DE IA */}
      {activeTab === 'ia' && (
        <form onSubmit={handleSaveAiSettings} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 max-w-4xl text-xs">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-[#172B3A]">
              Instruções e Diretrizes do Agente de IA
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Defina como seu assistente deve responder aos clientes e as regras de encaminhamento para humanos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                Nome do Agente Virtual *
              </label>
              <input
                type="text"
                required
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Ex: Lia (Assistente Virtual)"
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                Horário de Atendimento da Empresa *
              </label>
              <input
                type="text"
                required
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="Ex: Segunda a Sexta: 08:00 às 18:00"
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
              Mensagem de Boas-Vindas
            </label>
            <textarea
              rows={2}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Mensagem enviada no início do atendimento"
              className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
              Instruções Gerais de Comportamento (Prompt do Sistema)
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instrua o tom de voz, o que ele pode informar e como deve agir."
              className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
              Mensagem de Transferência para Atendente Humano *
            </label>
            <textarea
              rows={2}
              value={transferHumanMessage}
              onChange={(e) => setTransferHumanMessage(e.target.value)}
              placeholder="Mensagem disparada quando o cliente pede atendente ou tem uma dúvida sensível"
              className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
            />
          </div>

          {/* Lista de Perguntas Frequentes (FAQs) */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-[#172B3A] mb-2">
              Perguntas Frequentes Autorizadas (FAQs)
            </h4>
            <div className="space-y-2 mb-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3 bg-[#F8F6F0] rounded-xl border border-gray-200 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#172B3A]">P: {faq.question}</p>
                    <p className="text-gray-600 mt-1">R: {faq.answer}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Excluir FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Adicionar nova FAQ */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <input
                type="text"
                placeholder="Pergunta do cliente (ex: Qual o endereço de vocês?)"
                value={newFaqQuestion}
                onChange={(e) => setNewFaqQuestion(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-[#172B3A]"
              />
              <textarea
                rows={2}
                placeholder="Resposta autorizada para esta pergunta"
                value={newFaqAnswer}
                onChange={(e) => setNewFaqAnswer(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-[#172B3A]"
              />
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3 py-1.5 rounded-lg bg-[#244B56] text-white hover:bg-[#1a3840] font-medium text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Pergunta Frequente</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4 text-[#C9A96E]" />
              <span>{loading ? 'Salvando...' : 'Salvar Regras de IA'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ABA: DADOS DA EMPRESA */}
      {activeTab === 'empresa' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 max-w-3xl text-xs">
          <h3 className="text-base font-bold text-[#172B3A]">Dados Cadastrais da Empresa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 block text-[11px]">Nome da Empresa:</span>
              <span className="font-semibold text-sm text-[#172B3A]">{tenant?.name}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">E-mail Comercial:</span>
              <span className="font-semibold text-sm text-[#172B3A]">{tenant?.email}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">WhatsApp Oficial:</span>
              <span className="font-mono text-sm text-[#172B3A]">{tenant?.phone}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Identificador do Tenant:</span>
              <span className="font-mono text-xs text-gray-600">{tenant?.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA: WHATSAPP CLOUD API */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 max-w-3xl text-xs">
          <h3 className="text-base font-bold text-[#172B3A]">WhatsApp Business Cloud API (Meta)</h3>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
            <p className="font-bold">Webhook Operacional</p>
            <p className="text-[11px]">
              URL de Webhook: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">/api/webhooks/whatsapp</code>
            </p>
            <p className="text-[11px]">
              Modo: Assinatura de mensagens e eventos de status (sent, delivered, read) ativado.
            </p>
          </div>
        </div>
      )}

      {/* ABA: PALETA OFICIAL LEX FLOW */}
      {activeTab === 'paleta' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 max-w-3xl text-xs">
          <div>
            <h3 className="text-base font-bold text-[#172B3A]">
              Paleta Oficial e Padronização do SaaS Lex Flow
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cores comerciais estritas para interfaces modernas, profissionais e de alto contraste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-14 bg-[#172B3A] flex items-end p-2 text-white font-mono text-[11px] font-bold">
                #172B3A
              </div>
              <div className="p-3 bg-white">
                <p className="font-bold text-[#172B3A]">Azul-marinho profundo</p>
                <p className="text-[10px] text-gray-500">Sidebar e elementos de contraste</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-14 bg-[#244B56] flex items-end p-2 text-white font-mono text-[11px] font-bold">
                #244B56
              </div>
              <div className="p-3 bg-white">
                <p className="font-bold text-[#244B56]">Azul-petróleo</p>
                <p className="text-[10px] text-gray-500">Botões e ações principais</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-14 bg-[#C9A96E] flex items-end p-2 text-[#172B3A] font-mono text-[11px] font-bold">
                #C9A96E
              </div>
              <div className="p-3 bg-white">
                <p className="font-bold text-[#172B3A]">Dourado champanhe</p>
                <p className="text-[10px] text-gray-500">Destaques discretos</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-14 bg-[#F8F6F0] flex items-end p-2 text-[#172B3A] font-mono text-[11px] font-bold border-b border-gray-200">
                #F8F6F0
              </div>
              <div className="p-3 bg-white">
                <p className="font-bold text-[#172B3A]">Marfim</p>
                <p className="text-[10px] text-gray-500">Fundo da área principal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: LIMPEZA & AMBIENTE DE PRODUÇÃO */}
      {activeTab === 'limpeza' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 max-w-3xl text-xs">
          <div>
            <h3 className="text-base font-bold text-[#172B3A]">
              Limpeza Geral & Ambiente de Produção
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Zere o banco de dados e limpe todo o histórico de conversas, clientes e métricas para iniciar sua operação oficial.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-[#F8F6F0] rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Banco de Dados (Supabase / In-Memory):</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                  Pronto para Produção
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">WhatsApp Business Cloud API:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                  Sincronização Ativa
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Dados Residiais ou de Teste:</span>
                <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium">
                  Zerados
                </span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Atenção: Ação Irreversível</span>
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Ao clicar no botão abaixo, todas as conversas do WhatsApp, cadastros de clientes no CRM e contadores de mensagens serão apagados imediatamente.
              </p>
            </div>

            {cleaningStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                {cleaningStatus}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearDatabase}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Conversas, Clientes e Relatórios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

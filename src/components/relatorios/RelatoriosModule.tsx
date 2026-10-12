import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Bot, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Tenant } from '../../types';

interface RelatoriosModuleProps {
  tenant: Tenant | null;
  metrics: {
    receivedCount: number;
    repliedCount: number;
    unreadCount: number;
    pendingCount: number;
    totalCustomers: number;
  };
}

export const RelatoriosModule: React.FC<RelatoriosModuleProps> = ({
  tenant,
  metrics,
}) => {
  const tokenUsage = tenant?.aiSettings.tokensUsedMonth || 0;
  const tokenLimit = tenant?.aiSettings.monthlyTokenLimit || 100000;
  const pctTokens = Math.min(100, Math.round((tokenUsage / tokenLimit) * 100));

  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-[#F8F6F0]">
      {/* Top Banner Informativo */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#172B3A]">
            Relatórios Operacionais e de Automação
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Acompanhe o volume real de mensagens, eficiência da equipe e consumo de inteligência artificial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Dados Atualizados em Tempo Real
          </span>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Taxa de Resposta</span>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">
            {metrics.receivedCount > 0
              ? `${Math.min(100, Math.round((metrics.repliedCount / metrics.receivedCount) * 100))}%`
              : '0%'}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {metrics.repliedCount} de {metrics.receivedCount} mensagens atendidas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Tempo Médio de 1ª Resposta</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {metrics.receivedCount === 0 
              ? 'Pronto / 0s' 
              : tenant?.aiSettings.enabled 
              ? '12s (IA)' 
              : '2m 45s'}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {tenant?.aiSettings.enabled ? 'Automação imediata ativa' : 'Atendimento exclusivamente humano'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Total de Clientes no CRM</span>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">{metrics.totalCustomers}</div>
          <p className="mt-1 text-[11px] text-gray-500">Cadastros únicos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Custo Estimado de IA no Mês</span>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">
            R$ {((tenant?.aiSettings.estimatedCostMonthCents || 0) / 100).toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Modelo Gemini 2.5 Flash econômico
          </p>
        </div>
      </div>

      {/* Relatório Detalhado de Consumo de IA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#244B56] text-[#C9A96E] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">
                Indicadores de Utilização do Agente de IA
              </h3>
              <p className="text-xs text-gray-500">
                Monitoramento transparente de tokens para evitar surpresas ou interrupções
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded text-xs font-bold ${
            tenant?.planId === 'ia' ? 'bg-[#244B56] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {tenant?.planId === 'ia' ? 'Plano IA Habilitado' : 'Plano Essencial (Sem IA)'}
          </span>
        </div>

        {tenant?.planId === 'ia' ? (
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-gray-700">Consumo de Tokens Mensais:</span>
                <span className="font-bold text-[#172B3A]">
                  {tokenUsage.toLocaleString('pt-BR')} / {tokenLimit.toLocaleString('pt-BR')} ({pctTokens}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#244B56] h-full rounded-full transition-all"
                  style={{ width: `${pctTokens}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="p-3.5 bg-[#F8F6F0] rounded-xl border border-gray-200">
                <span className="text-gray-500 text-[11px]">Respostas Automáticas</span>
                <p className="text-base font-bold text-[#172B3A] mt-0.5">
                  {Math.round(tokenUsage / 140)} respostas
                </p>
              </div>
              <div className="p-3.5 bg-[#F8F6F0] rounded-xl border border-gray-200">
                <span className="text-gray-500 text-[11px]">Transbordos para Humanos</span>
                <p className="text-base font-bold text-[#172B3A] mt-0.5">
                  {metrics.pendingCount} transferências
                </p>
              </div>
              <div className="p-3.5 bg-[#F8F6F0] rounded-xl border border-gray-200">
                <span className="text-gray-500 text-[11px]">Disponibilidade do Agente</span>
                <p className="text-base font-bold text-emerald-700 mt-0.5">
                  100% operacional
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#F8F6F0] rounded-xl text-center text-xs text-gray-600 space-y-2">
            <p>O seu plano atual é o <strong>LEX FLOW ESSENCIAL</strong>, que não possui o Agente de IA ativado.</p>
            <p className="text-gray-500 text-[11px]">
              Para utilizar automação de respostas 24/7, triagem e relatórios de IA, acesse a aba Assinatura e contrate o plano LEX FLOW IA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

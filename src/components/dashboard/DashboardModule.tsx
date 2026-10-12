import React from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Users, 
  Bot, 
  TrendingUp, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Tenant, NavigationTab } from '../../types';

interface DashboardModuleProps {
  tenant: Tenant | null;
  onNavigateToTab: (tab: NavigationTab) => void;
  metrics: {
    receivedCount: number;
    repliedCount: number;
    unreadCount: number;
    pendingCount: number;
    totalCustomers: number;
  };
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  tenant,
  onNavigateToTab,
  metrics,
}) => {
  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-[#F8F6F0]">
      {/* 6 Cards de Dados Reais Conforme Seção 10 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Mensagens Recebidas */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Recebidas</span>
            <div className="w-7 h-7 rounded-lg bg-[#244B56]/10 text-[#244B56] flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">{metrics.receivedCount}</div>
          <p className="mt-1 text-[10px] text-gray-500">Total de mensagens</p>
        </div>

        {/* Card 2: Mensagens Respondidas */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Respondidas</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">{metrics.repliedCount}</div>
          <p className="mt-1 text-[10px] text-gray-500">Humano e IA</p>
        </div>

        {/* Card 3: Conversas Não Lidas */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Não Lidas</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{metrics.unreadCount}</div>
          <p className="mt-1 text-[10px] text-gray-500">Requer atenção</p>
        </div>

        {/* Card 4: Atendimentos Pendentes */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Pendentes</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">{metrics.pendingCount}</div>
          <p className="mt-1 text-[10px] text-gray-500">Conversas abertas</p>
        </div>

        {/* Card 5: Clientes Atendidos */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Clientes</span>
            <div className="w-7 h-7 rounded-lg bg-[#172B3A]/10 text-[#172B3A] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">{metrics.totalCustomers}</div>
          <p className="mt-1 text-[10px] text-gray-500">Cadastrados no CRM</p>
        </div>

        {/* Card 6: Consumo de IA (quando aplicável) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Tokens de IA</span>
            <div className="w-7 h-7 rounded-lg bg-[#C9A96E]/20 text-[#172B3A] flex items-center justify-center border border-[#C9A96E]/40">
              <Bot className="w-3.5 h-3.5 text-[#C9A96E]" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#172B3A]">
            {tenant?.planId === 'ia' ? `${Math.round((tenant.aiSettings.tokensUsedMonth || 0) / 1000)}k` : 'N/A'}
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            {tenant?.planId === 'ia' ? 'Uso mensal' : 'Apenas plano IA'}
          </p>
        </div>
      </div>

      {/* Seção Central de Operações */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card do Agente de IA e Status do Plano */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status da Automação
              </span>
              <Bot className="w-4 h-4 text-[#244B56]" />
            </div>

            <h3 className="text-base font-bold text-[#172B3A]">
              {tenant?.planId === 'ia' ? tenant.aiSettings.agentName : 'Agente de IA Inativo'}
            </h3>

            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              {tenant?.planId === 'ia' ? (
                tenant.aiSettings.enabled ? (
                  'Atendimento automático ativo. O agente responde dúvidas frequentes e transfere para humanos quando necessário.'
                ) : (
                  'O atendimento automático por IA está desativado no momento. As mensagens serão respondidas exclusivamente por atendentes humanos.'
                )
              ) : (
                'O plano LEX FLOW ESSENCIAL opera no modo de atendimento humano. Faça o upgrade para ativar o agente de IA.'
              )}
            </p>

            {tenant?.planId === 'ia' && (
              <div className="mt-4 p-3 bg-[#F8F6F0] rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tokens consumidos:</span>
                  <span className="font-bold text-[#172B3A]">{tenant.aiSettings.tokensUsedMonth.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Limite mensal:</span>
                  <span className="text-gray-700">{tenant.aiSettings.monthlyTokenLimit.toLocaleString('pt-BR')}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#244B56] h-full"
                    style={{ width: `${Math.min(100, (tenant.aiSettings.tokensUsedMonth / tenant.aiSettings.monthlyTokenLimit) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToTab('whatsapp')}
              className="text-xs font-semibold text-[#244B56] hover:underline flex items-center gap-1"
            >
              <span>Abrir Central de Mensagens</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Bot,
  Power,
  CreditCard,
  Trash2
} from 'lucide-react';
import { NavigationTab, Tenant } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onOpenNovaConversa: () => void;
    onNavigateToTab: (tab: NavigationTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tenant: Tenant | null;
  onToggleAi: () => void;
  onClearData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenNovaConversa,
    onNavigateToTab,
  searchQuery,
  onSearchChange,
  tenant,
  onToggleAi,
  onClearData,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Calcular dias de teste
  const now = new Date();
  const trialEnd = tenant?.trialEndsAt ? new Date(tenant.trialEndsAt) : null;
  const daysRemaining = trialEnd 
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialActive = tenant?.subscriptionStatus === 'trialing' && daysRemaining > 0;
  const isTrialExpired = tenant?.subscriptionStatus === 'expired' || (tenant?.subscriptionStatus === 'trialing' && daysRemaining <= 0);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Painel Geral de Atendimento',
          subtitle: 'Métricas em tempo real, volume de mensagens e controle de atendimentos'
        };
      case 'whatsapp':
        return {
          title: 'Central de Atendimento WhatsApp',
          subtitle: 'Conversas ativas, histórico de clientes e estados de envio em tempo real'
        };
      case 'clientes':
        return {
          title: 'Gestão de Clientes',
          subtitle: 'Histórico de contatos, notas de atendimento e etiquetas'
        };
      
      case 'assinatura':
        return {
          title: 'Assinatura & Cobrança PIX',
          subtitle: 'Situação do plano, geração de PIX via Efí Bank e histórico de faturas'
        };
      case 'configuracoes':
        return {
          title: 'Configurações da Empresa & IA',
          subtitle: 'Instruções do agente, respostas frequentes, horários e equipe'
        };
      case 'admin':
        return {
          title: 'Painel Administrativo da Plataforma',
          subtitle: 'Área restrita de gestão de empresas, assinaturas, PIX e consumo global'
        };
    }
  };

  const headerInfo = getTitle();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      {/* Banner de Teste Grátis ou Expiração */}
      {isTrialActive && (
        <div className="bg-[#244B56] text-white px-4 sm:px-6 py-2 text-xs flex items-center justify-between border-b border-[#C9A96E]/40">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>
              Seu período de teste termina em <strong>{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</strong> ({trialEnd?.toLocaleDateString('pt-BR')}).
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('assinatura')}
            className="text-[11px] font-semibold text-[#C9A96E] hover:underline flex items-center gap-1"
          >
            <span>Assinar Plano Definitivo</span>
            <span>→</span>
          </button>
        </div>
      )}

      {isTrialExpired && (
        <div className="bg-amber-600 text-white px-4 sm:px-6 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>Seu período de teste de 7 dias encerrou. Contrate um plano para manter o atendimento ativo.</span>
          </div>
          <button
            onClick={() => onNavigateToTab('assinatura')}
            className="text-[11px] font-bold bg-white text-amber-800 px-2.5 py-0.5 rounded shadow-xs hover:bg-gray-100"
          >
            Contratar via PIX
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-gray-50 border border-gray-200 text-[#172B3A] hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#172B3A] tracking-tight">
              {headerInfo.title}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block font-normal">
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: AI Toggle + Search + Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* BOTÃO DE ATENDIMENTO AUTOMÁTICO COM IA (Requisito da Seção 8) */}
          {tenant?.planId === 'ia' && (
            <div className="hidden sm:flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[#F8F6F0] border border-gray-200">
              <div className="flex items-center gap-1.5">
                <Bot className={`w-4 h-4 ${tenant.aiSettings.enabled ? 'text-[#244B56]' : 'text-gray-400'}`} />
                <span className="text-[11px] font-semibold text-[#172B3A]">
                  ATENDIMENTO AUTOMÁTICO:
                </span>
              </div>
              <button
                onClick={onToggleAi}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  tenant.aiSettings.enabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={tenant.aiSettings.enabled ? 'Clique para desativar o atendimento por IA' : 'Clique para ativar o atendimento por IA'}
              >
                <Power className="w-3 h-3" />
                <span>{tenant.aiSettings.enabled ? 'ATIVO' : 'DESATIVADO'}</span>
              </button>
            </div>
          )}

          {/* Quick Search */}
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cliente ou mensagem..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#244B56]"
            />
          </div>

          {/* Botão Nova Conversa */}
          <button
            onClick={onOpenNovaConversa}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#244B56] text-white hover:bg-[#1a3840] font-medium text-xs shadow-xs transition-all border border-[#C9A96E]/50"
          >
            <Plus className="w-4 h-4 text-[#C9A96E]" />
            <span className="hidden sm:inline">Nova Conversa</span>
            <span className="sm:hidden">Conversa</span>
          </button>

          {/* Botão Limpar / Zerar Atendimentos */}
          {onClearData && (
            <button
              onClick={onClearData}
              title="Limpar todas as conversas, clientes e relatórios para ambiente de produção limpo"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-medium text-xs transition-all border border-gray-200"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
              <span>Limpar Dados</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

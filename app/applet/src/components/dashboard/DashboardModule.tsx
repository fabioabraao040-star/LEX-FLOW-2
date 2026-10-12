import React from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle
} from 'lucide-react';
import { Tenant, NavigationTab } from '@/src/types';

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
  tenant: _tenant,
  onNavigateToTab: _onNavigateToTab,
  metrics,
}) => {
  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-[#F8F6F0]">
      {/* 5 Cards de Dados Reais Essenciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
      </div>
    </div>
  );
};

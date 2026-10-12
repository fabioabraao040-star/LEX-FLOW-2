import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings, 
  ShieldCheck, 
  Wifi, 
  ChevronRight, 
  LogOut,
  Building2,
  Lock
} from 'lucide-react';
import { NavigationTab, Tenant, User } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  tenant: Tenant | null;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  isOpenMobile,
  onCloseMobile,
  tenant,
  user,
  onLogout,
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'whatsapp',
      label: 'Atendimento WhatsApp',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-[#EF4444] text-white'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />
    },
    
    {
      id: 'assinatura',
      label: 'Assinatura e Pagamentos',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-[#172B3A] text-white flex flex-col justify-between border-r border-[#244B56] shadow-xl transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Top Area */}
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="p-5 border-b border-[#244B56] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#244B56] border-2 border-[#C9A96E] flex items-center justify-center text-[#E5C384] shadow-md">
                <MessageSquare className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-xs">LEX</span>
                  <span className="font-extrabold text-xl tracking-tight text-[#E5C384] drop-shadow-xs">FLOW</span>
                </div>
                <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
                  Atendimento & Automação
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Status Indicator */}
          <div className="mx-4 mt-3.5 p-3 rounded-lg bg-[#244B56]/50 border border-[#244B56] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-semibold text-white">WhatsApp Business API</p>
                <p className="text-[10px] text-gray-300 truncate max-w-[140px]">
                  {tenant?.whatsappPhoneNumber || 'Oficial Meta'}
                </p>
              </div>
            </div>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-2" aria-label="Navegação Principal">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#244B56] text-white shadow-sm border-l-4 border-[#C9A96E]'
                      : 'text-gray-300 hover:bg-[#244B56]/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#C9A96E]' : 'text-gray-400 group-hover:text-[#C9A96E] transition-colors'}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-[13px]">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-4 h-4 text-[#C9A96E]/60" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Footer Area */}
        <div className="p-4 border-t border-[#244B56] bg-[#12222e]">
          {/* Admin platform link */}
          <div className="mb-3 px-1">
            <button
              onClick={() => { onTabChange('admin'); onCloseMobile(); }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between transition-colors ${
                activeTab === 'admin'
                  ? 'bg-[#C9A96E] text-[#172B3A] font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#244B56]/40'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#C9A96E]" />
                Área Restrita (Admin SaaS)
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#172B3A] border border-[#244B56]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#244B56] border border-[#C9A96E]/50 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'LF'}
              </div>
              <div className="leading-tight truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-gray-400 truncate">{tenant?.name || 'Empresa'}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              title="Sair da conta"
              className="p-1.5 text-gray-400 hover:text-[#C9A96E] hover:bg-[#244B56] rounded transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-400 px-1 font-medium">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#C9A96E]" /> {tenant?.planId === 'ia' ? 'Plano IA Ativo' : 'Plano Essencial'}
            </span>
            <span>v2.8 SaaS</span>
          </div>
        </div>
      </aside>
    </>
  );
};

/**
 * LEX FLOW — Painel SaaS Comercial & Atendimento WhatsApp
 */

import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  Tenant, 
  User, 
  Conversation, 
  Message, 
  Customer 
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { WhatsAppModule } from './components/whatsapp/WhatsAppModule';
import { ClientesModule } from './components/clientes/ClientesModule';
import { BillingModule } from './components/billing/BillingModule';
import { ConfiguracoesModule } from './components/configuracoes/ConfiguracoesModule';
import { AdminModule } from './components/admin/AdminModule';
import { NovaConversaModal } from './components/modals/NovaConversaModal';

export default function App() {
  // Navigation & View Mode
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth State
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login'>('register');

  // WhatsApp & CRM Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reportsData, setReportsData] = useState<any>({
    metrics: {
      receivedCount: 0,
      repliedCount: 0,
      unreadCount: 0,
      pendingCount: 0,
      totalCustomers: 0
    }
  });

  // Modal State
  const [novaConversaOpen, setNovaConversaOpen] = useState(false);
  
  // Carregar dados do tenant e conversas na inicialização
  const refreshTenantData = async () => {
    try {
      const res = await fetch('/api/tenants/current', {
        headers: { 'x-tenant-id': tenant?.id || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setTenant(data.tenant);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/whatsapp/conversations', {
        headers: { 'x-tenant-id': tenant?.id || '' }
      });
      if (res.ok) {
        const list: Conversation[] = await res.json();
        setConversations(list);
        if (list.length > 0 && !selectedConversationId) {
          setSelectedConversationId(list[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', {
        headers: { 'x-tenant-id': tenant?.id || '' }
      });
      if (res.ok) {
        const list: Customer[] = await res.json();
        setCustomers(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { 'x-tenant-id': tenant?.id || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setReportsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Carregar mensagens da conversa ativa
  const fetchMessages = async (convId: string) => {
    if (!convId) return;
    try {
      const res = await fetch(`/api/whatsapp/conversations/${convId}/messages`, {
        headers: { 'x-tenant-id': tenant?.id || '' }
      });
      if (res.ok) {
        const msgs = await res.json();
        setCurrentMessages(msgs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Inicializar carregamento de dados
    refreshTenantData();
    fetchConversations();
    fetchCustomers();
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Handlers de Ações
  const handleSendMessage = async (conversationId: string, text: string) => {
    try {
      const res = await fetch(`/api/whatsapp/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant?.id || ''
        },
        body: JSON.stringify({
          text,
          senderName: user?.name || 'Atendente Lex Flow'
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setCurrentMessages((prev) => [...prev, newMsg]);
        fetchConversations();
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Tem certeza de que deseja limpar todas as conversas, clientes e relatórios? O sistema será completamente zerado e pronto para produção.')) {
      return;
    }
    try {
      const res = await fetch('/api/whatsapp/clear', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenant?.id || ''
        }
      });
      if (res.ok) {
        setConversations([]);
        setSelectedConversationId('');
        setCurrentMessages([]);
        setCustomers([]);
        setReportsData({
          metrics: {
            receivedCount: 0,
            repliedCount: 0,
            unreadCount: 0,
            pendingCount: 0,
            totalCustomers: 0
          }
        });
        await refreshTenantData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAiGlobal = async () => {
    try {
      const res = await fetch('/api/ai/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant?.id || ''
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao alterar atendimento automático');
        return;
      }
      refreshTenantData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAiConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/whatsapp/conversations/${conversationId}/toggle-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant?.id || ''
        }
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConversationStatus = async (conversationId: string, status: 'aberta' | 'aguardando' | 'finalizada') => {
    try {
      await fetch(`/api/whatsapp/conversations/${conversationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant?.id || ''
        },
        body: JSON.stringify({ status })
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomer = async (cust: { name: string; phone: string; email: string; notes: string; tags: string[] }) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant?.id || ''
        },
        body: JSON.stringify(cust)
      });
      if (res.ok) {
        fetchCustomers();
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartNewChat = async (name: string, phone: string, initialMessage: string) => {
    try {
      // Cria cliente se não existir
      await handleAddCustomer({
        name,
        phone,
        email: '',
        notes: 'Iniciado via Nova Conversa',
        tags: ['WhatsApp']
      });

      // Recarrega conversas e seleciona
      await fetchConversations();
      setActiveTab('whatsapp');
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Se o usuário optar por ver a Landing Page Comercial
  if (showLandingPage) {
    return (
      <>
        <LandingPage
          onStartTrial={() => {
            setAuthModalMode('register');
            setAuthModalOpen(true);
          }}
          onLoginClick={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(t, u) => {
            setTenant(t);
            setUser(u);
            setShowLandingPage(false);
            setActiveTab('dashboard');
            refreshTenantData();
            fetchConversations();
          }}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F6F0] text-[#172B3A] font-['Inter',sans-serif]">
      {/* Sidebar Comercial */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        tenant={tenant}
        user={user}
        onLogout={() => setShowLandingPage(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#F8F6F0]">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNovaConversa={() => setNovaConversaOpen(true)}
                    onNavigateToTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tenant={tenant}
          onToggleAi={handleToggleAiGlobal}
          onClearData={handleClearData}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <DashboardModule
              tenant={tenant}
              onNavigateToTab={setActiveTab}
              metrics={reportsData.metrics}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppModule
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              onToggleAiConversation={handleToggleAiConversation}
              onUpdateStatus={handleUpdateConversationStatus}
              tenant={tenant}
              onOpenNovaConversa={() => setNovaConversaOpen(true)}
              onClearConversations={handleClearData}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientesModule
              customers={customers}
              onOpenChat={(phone) => {
                const conv = conversations.find((c) => c.customerPhone === phone);
                if (conv) {
                  setSelectedConversationId(conv.id);
                  setActiveTab('whatsapp');
                } else {
                  setNovaConversaOpen(true);
                }
              }}
              onAddCustomer={handleAddCustomer}
            />
          )}

          

          {activeTab === 'assinatura' && (
            <BillingModule
              tenant={tenant}
              onRefreshTenant={refreshTenantData}
            />
          )}

          {activeTab === 'configuracoes' && (
            <ConfiguracoesModule
              tenant={tenant}
              onRefreshTenant={refreshTenantData}
            />
          )}

          {activeTab === 'admin' && (
            <AdminModule />
          )}
        </main>
      </div>

      {/* Modais */}
      <NovaConversaModal
        isOpen={novaConversaOpen}
        onClose={() => setNovaConversaOpen(false)}
        onStartNewChat={handleStartNewChat}
      />

      

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(t, u) => {
          setTenant(t);
          setUser(u);
          setShowLandingPage(false);
          refreshTenantData();
          fetchConversations();
        }}
      />
    </div>
  );
}

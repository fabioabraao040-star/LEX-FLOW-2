import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Building2, 
  CreditCard, 
  Bot, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  RefreshCw, 
  Lock,
  Search,
  Eye,
  MessageSquare,
  LifeBuoy,
  FileText,
  Check,
  X,
  Send,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface AdminOverviewData {
  totalTenants: number;
  activeSubscriptions: number;
  trialingTenants: number;
  canceledTenants: number;
  totalTokensAggregated: number;
  tenants: any[];
  customers: any[];
  charges: any[];
  supportTickets: any[];
  systemErrors: any[];
  recentAuditLogs: any[];
}

export const AdminModule: React.FC = () => {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tenants' | 'financeiro' | 'ai_errors' | 'suporte' | 'audit'>('overview');
  const [search, setSearch] = useState('');
  
  // Modals & States
  const [suspendModalTenant, setSuspendModalTenant] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [replyTicketModal, setReplyTicketModal] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: {
          'Authorization': 'Bearer mock_token_admin_master',
          'x-user-email': 'admin@lexflow.com.br'
        }
      });
      if (res.status === 403) {
        setErrorMsg('Acesso negado (HTTP 403). Você não possui privilégios de Administrador Master da plataforma.');
        setLoading(false);
        return;
      }
      if (res.status === 401) {
        setErrorMsg('Autenticação necessária (HTTP 401). Faça login com a conta master.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro de conexão ao carregar painel master.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (tenantId: string, willSuspend: boolean) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/tenant/${tenantId}/suspend`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token_admin_master',
          'x-user-email': 'admin@lexflow.com.br'
        },
        body: JSON.stringify({
          suspend: willSuspend,
          reason: suspendReason || 'Decisão administrativa do Administrador Master'
        })
      });
      setSuspendModalTenant(null);
      setSuspendReason('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAiFix = async (fixId: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/fix/${fixId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock_token_admin_master',
          'x-user-email': 'admin@lexflow.com.br'
        }
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/ticket/${ticketId}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token_admin_master',
          'x-user-email': 'admin@lexflow.com.br'
        },
        body: JSON.stringify({
          replyText,
          newStatus: 'resolvido'
        })
      });
      setReplyTicketModal(null);
      setReplyText('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center bg-[#F8F6F0]">
        <RefreshCw className="w-8 h-8 text-[#244B56] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#172B3A]">Carregando Painel Master Seguro...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center bg-[#F8F6F0]">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl max-w-lg text-center shadow-lg">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-red-900 mb-1">Acesso Restrito ao Administrador Master</h3>
          <p className="text-xs text-red-700">{errorMsg}</p>
          <button
            onClick={fetchAdminData}
            className="mt-5 px-4 py-2 bg-[#172B3A] text-white rounded-xl text-xs font-semibold hover:bg-[#244B56]"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-[#F8F6F0]">
      {/* Top Master Header */}
      <div className="bg-[#172B3A] text-white p-6 rounded-2xl border border-[#244B56] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#244B56] border-2 border-[#C9A96E] flex items-center justify-center text-[#E5C384]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">PAINEL ADMINISTRATIVO MASTER DO LEX FLOW</h2>
              <span className="bg-[#C9A96E] text-[#172B3A] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Exclusivo Master
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Governança global, controle de assinaturas, cobranças Efí Pix, supervisão de IA e auditoria de produção.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-xs font-semibold flex items-center gap-2 border border-[#C9A96E]/40 text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Dados</span>
          </button>
          <button
            onClick={async () => {
              if (window.confirm('ATENÇÃO: Deseja realmente zerar todos os dados e conversas residuais para homologação final de produção?')) {
                await fetch('/api/admin/clear-data', { 
                  method: 'POST',
                  headers: {
                    'Authorization': 'Bearer mock_token_admin_master',
                    'x-user-email': 'admin@lexflow.com.br'
                  }
                });
                fetchAdminData();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-xs font-semibold flex items-center gap-2 border border-red-500/30 text-white"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Zerar Global</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visão Geral & Métricas', icon: <Building2 className="w-4 h-4" /> },
          { id: 'tenants', label: `Empresas & Clientes (${data?.totalTenants || 0})`, icon: <Users className="w-4 h-4" /> },
          { id: 'financeiro', label: `Financeiro & Pix (${data?.charges.length || 0})`, icon: <CreditCard className="w-4 h-4" /> },
          { id: 'ai_errors', label: `Erros & Diagnósticos IA (${data?.systemErrors.length || 0})`, icon: <Bot className="w-4 h-4" /> },
          { id: 'suporte', label: `Central de Suporte (${data?.supportTickets.length || 0})`, icon: <LifeBuoy className="w-4 h-4" /> },
          { id: 'audit', label: 'Auditoria de Ações', icon: <FileText className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeSubTab === tab.id
                ? 'bg-[#244B56] text-white shadow-sm border border-[#C9A96E]'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className={activeSubTab === tab.id ? 'text-[#C9A96E]' : 'text-gray-500'}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: VISÃO GERAL */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Total de Empresas</span>
              <div className="mt-2 text-2xl font-extrabold text-[#172B3A]">{data?.totalTenants || 0}</div>
              <p className="mt-1 text-[11px] text-gray-500">Tenants cadastrados no SaaS</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Assinaturas Ativas</span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-700">{data?.activeSubscriptions || 0}</div>
              <p className="mt-1 text-[11px] text-gray-500">Pagantes confirmados</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Período de Teste (7 Dias)</span>
              <div className="mt-2 text-2xl font-extrabold text-[#244B56]">{data?.trialingTenants || 0}</div>
              <p className="mt-1 text-[11px] text-gray-500">Testando plano com IA</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Consumo Agregado IA</span>
              <div className="mt-2 text-2xl font-extrabold text-[#172B3A]">
                {Math.round((data?.totalTokensAggregated || 0) / 1000)}k <span className="text-xs font-normal text-gray-500">tokens</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Uso global no mês</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Diagnostics & Pending Fixes Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#244B56]" />
                  <h3 className="text-sm font-bold text-[#172B3A]">Diagnósticos & Correções Sugeridas pela IA</h3>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  Aprovação Master Obrigatória
                </span>
              </div>
              <div className="space-y-3">
                {data?.systemErrors.map((err) => (
                  <div key={err.id} className="p-3.5 rounded-xl bg-[#F8F6F0] border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#172B3A]">{err.component}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        err.status === 'aplicado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {err.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Erro: <code className="text-red-600">{err.errorMsg}</code></p>
                    <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                      <strong>Diagnóstico IA:</strong> {err.aiDiagnosis}
                    </p>
                    <p className="text-xs text-[#244B56] bg-blue-50/50 p-2 rounded border border-blue-100">
                      <strong>Correção Proposta:</strong> {err.suggestedFix}
                    </p>
                    {!err.isApproved && (
                      <div className="flex justify-end pt-1">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApproveAiFix(err.id)}
                          className="px-3 py-1.5 bg-[#244B56] hover:bg-[#1a3840] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Aprovar e Aplicar em Produção</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Logs Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-sm font-bold text-[#172B3A] mb-4">Últimas Ações & Auditoria Master</h3>
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {data?.recentAuditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="p-3 bg-[#F8F6F0] rounded-xl border border-gray-200 text-xs flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#244B56] mr-1.5">[{log.action}]</span>
                      <span className="text-gray-700">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPRESAS & CLIENTES */}
      {activeSubTab === 'tenants' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">Empresas Cadastradas (Tenants)</h3>
              <p className="text-xs text-gray-500">Gerencie o licenciamento, suspensão e status de cada assinante.</p>
            </div>
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por empresa ou e-mail..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#172B3A] text-white text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Empresa / ID</th>
                  <th className="py-3 px-4">E-mail / Telefone</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Assinatura</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Tokens IA</th>
                  <th className="py-3 px-4 text-center">Controle Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.tenants
                  .filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()))
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#172B3A]">{t.name}</p>
                        <span className="font-mono text-[10px] text-gray-400">{t.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-700">{t.email}</p>
                        <p className="text-[10px] text-gray-400">{t.phone || 'Sem telefone'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.planId === 'ia' ? 'bg-[#244B56] text-white' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {t.planId.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.subscriptionStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.subscriptionStatus === 'trialing'
                            ? 'bg-blue-100 text-[#244B56]'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {t.subscriptionStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {t.whatsappConnected ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">Conectado</span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Pendente</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700">
                        {t.tokensUsedMonth ? `${t.tokensUsedMonth.toLocaleString('pt-BR')} tok` : '0'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSuspendModalTenant(t)}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            t.suspended
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {t.suspended ? 'Reativar Conta' : 'Suspender'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCEIRO & PIX EFÍ */}
      {activeSubTab === 'financeiro' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">Histórico Financeiro & Cobranças Pix (Efí Bank)</h3>
              <p className="text-xs text-gray-500">Acompanhe confirmações de pagamento em tempo real com idempotência garantida.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200">
              Gateway Oficial Efí Bank Integrado
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#172B3A] text-white text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">ID / Transação TXID</th>
                  <th className="py-3 px-4">Tenant ID</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Criado em</th>
                  <th className="py-3 px-4">Pago em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.charges.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-gray-700">
                      <p className="font-bold text-[#172B3A]">{c.id}</p>
                      <span className="text-[10px] text-gray-400">{c.txid}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">{c.tenantId}</td>
                    <td className="py-3 px-4 font-bold text-[#244B56]">{c.planId?.toUpperCase()}</td>
                    <td className="py-3 px-4 font-bold text-[#172B3A]">
                      R$ {(c.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {c.paidAt ? new Date(c.paidAt).toLocaleString() : 'Aguardando'}
                    </td>
                  </tr>
                ))}
                {(!data?.charges || data.charges.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Nenhuma cobrança registrada até o momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ERROS & IA */}
      {activeSubTab === 'ai_errors' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#172B3A]">Erros Técnicos & Diagnósticos de IA</h3>
            <p className="text-xs text-gray-500">A IA monitora o sistema 24/7 e sugere correções seguras que exigem sua aprovação explícita antes de serem aplicadas.</p>
          </div>

          <div className="space-y-4">
            {data?.systemErrors.map((err) => (
              <div key={err.id} className="p-4 rounded-xl bg-[#F8F6F0] border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-[#172B3A]">{err.component}</span>
                    <span className="text-[10px] font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">{err.id}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    err.status === 'aplicado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {err.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-gray-700"><strong>Erro Detectado:</strong> <code className="text-red-600">{err.errorMsg}</code></p>
                  <p className="text-gray-700 bg-white p-2.5 rounded border border-gray-200">
                    <strong>Análise / Diagnóstico IA:</strong> {err.aiDiagnosis}
                  </p>
                  <p className="text-[#244B56] bg-blue-50/70 p-2.5 rounded border border-blue-200">
                    <strong>Correção Proposta pela IA:</strong> {err.suggestedFix}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-[11px] text-gray-400">Detectado em: {new Date(err.detectedAt).toLocaleString()}</span>
                  {!err.isApproved ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleApproveAiFix(err.id)}
                      className="px-4 py-2 bg-[#244B56] hover:bg-[#1a3840] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4 text-[#C9A96E]" />
                      <span>Aprovar e Aplicar Correção (Master)</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Aprovado e Aplicado em {new Date(err.approvedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUPORTE & CHAMADOS */}
      {activeSubTab === 'suporte' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#172B3A]">Central de Suporte & Chamados Técnicos</h3>
            <p className="text-xs text-gray-500">Atenda dúvidas e solicitações enviadas pelas empresas assinantes.</p>
          </div>

          <div className="space-y-3">
            {data?.supportTickets.map((tkt) => (
              <div key={tkt.id} className="p-4 rounded-xl bg-[#F8F6F0] border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#172B3A]">{tkt.tenantName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({tkt.id})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tkt.status === 'resolvido' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {tkt.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#172B3A]">{tkt.subject}</p>
                <p className="text-xs text-gray-600 bg-white p-2.5 rounded border border-gray-200">{tkt.message}</p>

                {tkt.responses?.length > 0 && (
                  <div className="space-y-1.5 pl-3 border-l-2 border-[#244B56]">
                    {tkt.responses.map((resp: any, i: number) => (
                      <div key={i} className="text-xs bg-white p-2 rounded border border-gray-100">
                        <span className="font-bold text-[#244B56] mr-2">{resp.sender}:</span>
                        <span className="text-gray-700">{resp.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { setReplyTicketModal(tkt); setReplyText(''); }}
                    className="px-3.5 py-1.5 bg-[#244B56] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3840]"
                  >
                    Responder Chamado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDITORIA */}
      {activeSubTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#172B3A]">Histórico Completo de Auditoria da Plataforma</h3>
            <p className="text-xs text-gray-500">Registro imutável de todas as ações administrativas, webhooks e eventos do sistema.</p>
          </div>

          <div className="space-y-2">
            {data?.recentAuditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-[#F8F6F0] rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#244B56] mr-2">[{log.action}]</span>
                  <span className="text-gray-700">{log.details}</span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Suspensão de Tenant */}
      {suspendModalTenant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-xs shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#172B3A]">
              {suspendModalTenant.suspended ? 'Reativar Conta da Empresa' : 'Suspender Conta da Empresa'}
            </h3>
            <p className="text-gray-600">
              Empresa: <strong>{suspendModalTenant.name}</strong> ({suspendModalTenant.id})
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Justificativa para registro na auditoria:
              </label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Informe o motivo..."
                className="w-full p-2.5 bg-[#F8F6F0] border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalTenant(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleToggleSuspend(suspendModalTenant.id, !suspendModalTenant.suspended)}
                className={`px-4 py-2 rounded-xl text-white font-semibold ${
                  suspendModalTenant.suspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar {suspendModalTenant.suspended ? 'Reativação' : 'Suspensão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resposta a Chamado */}
      {replyTicketModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-xs shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#172B3A]">Responder Chamado de Suporte</h3>
            <p className="text-gray-600">
              Empresa: <strong>{replyTicketModal.tenantName}</strong> | Assunto: {replyTicketModal.subject}
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Sua resposta como Administrador Master:
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva a orientação ou solução para a empresa..."
                className="w-full p-2.5 bg-[#F8F6F0] border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyTicketModal(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleReplyTicket(replyTicketModal.id)}
                className="px-4 py-2 rounded-xl bg-[#244B56] text-white font-semibold hover:bg-[#1a3840]"
              >
                Enviar Resposta & Resolver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

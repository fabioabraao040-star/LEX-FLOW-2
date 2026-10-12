import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Tenant, PlanId, PixCharge, PLANS } from '../../types';

interface BillingModuleProps {
  tenant: Tenant | null;
  onRefreshTenant: () => void;
}

export const BillingModule: React.FC<BillingModuleProps> = ({
  tenant,
  onRefreshTenant,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(tenant?.planId || 'ia');
  const [currentCharge, setCurrentCharge] = useState<PixCharge | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [pollingActive, setPollingActive] = useState(false);

  // Polling para checar status da cobrança PIX
  useEffect(() => {
    let interval: any;
    if (currentCharge && currentCharge.status === 'PENDENTE') {
      setPollingActive(true);
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/billing/pix-status/${currentCharge.txid}`);
          const data = await res.json();
          if (data.charge && data.charge.status === 'CONCLUIDA') {
            setCurrentCharge(data.charge);
            setStatusMessage('Pagamento PIX confirmado com sucesso! Assinatura ativada.');
            clearInterval(interval);
            setPollingActive(false);
            onRefreshTenant();
          }
        } catch (err) {
          console.error(err);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [currentCharge, onRefreshTenant]);

  const handleGeneratePix = async (planId: PlanId) => {
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/billing/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant?.id || ''
        },
        body: JSON.stringify({ planId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar cobrança PIX');

      setCurrentCharge(data.charge);
      setSelectedPlanId(planId);
      setStatusMessage('Cobrança PIX emitida com sucesso pelo Efí Bank.');
    } catch (err: any) {
      setStatusMessage(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!currentCharge) return;
    navigator.clipboard.writeText(currentCharge.copiaECola);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestSimulatePayment = async () => {
    if (!currentCharge) return;
    setLoading(true);
    try {
      const res = await fetch('/api/billing/test-confirm-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: currentCharge.txid })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentCharge(data.charge);
        setStatusMessage('Pagamento confirmado em ambiente de homologação. Assinatura ativa!');
        onRefreshTenant();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (tenant?.subscriptionStatus) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Assinatura Ativa</span>;
      case 'trialing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#244B56]">Período de Teste Grátis</span>;
      case 'awaiting_payment':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Aguardando Pagamento PIX</span>;
      case 'past_due':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Vencida</span>;
      case 'expired':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Teste Expirado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Inativo</span>;
    }
  };

  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-[#F8F6F0]">
      {/* Situação Atual da Assinatura */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Situação Atual da Conta</span>
          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-xl font-bold text-[#172B3A]">
              {tenant?.planId === 'ia' ? 'LEX FLOW IA (R$ 499/mês)' : 'LEX FLOW ESSENCIAL (R$ 299/mês)'}
            </h2>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {tenant?.subscriptionStatus === 'trialing' ? (
              <>
                Seu teste de 7 dias é válido até{' '}
                <strong>{new Date(tenant.trialEndsAt).toLocaleDateString('pt-BR')} às {new Date(tenant.trialEndsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.
              </>
            ) : tenant?.subscriptionStatus === 'active' ? (
              <>
                Próxima renovação prevista para{' '}
                <strong>{tenant.subscriptionRenewalAt ? new Date(tenant.subscriptionRenewalAt).toLocaleDateString('pt-BR') : '30 dias'}</strong>.
              </>
            ) : (
              'Para continuar utilizando o atendimento por WhatsApp, selecione um plano abaixo e realize o pagamento via PIX.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshTenant}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5"
            title="Atualizar status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Grid de Seleção dos Planos Comerciais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Plano Essencial */}
        <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
          selectedPlanId === 'essencial'
            ? 'bg-white border-[#244B56] ring-2 ring-[#244B56]/20 shadow-md'
            : 'bg-white border-gray-200 shadow-xs'
        }`}>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Atendimento Humano</span>
                <h3 className="text-lg font-bold text-[#172B3A] mt-0.5">LEX FLOW ESSENCIAL</h3>
              </div>
              <span className="text-lg font-bold text-[#172B3A]">R$ 299,00<span className="text-xs text-gray-500 font-normal">/mês</span></span>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              Ideal para equipes que precisam de uma central unificada de WhatsApp sem automação de IA.
            </p>

            <div className="mt-5 space-y-2 text-xs text-gray-700">
              {PLANS.essencial.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#244B56] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-3.5 h-3.5 text-center">✕</span>
                <span className="line-through">Agente de IA respondendo automaticamente</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleGeneratePix('essencial')}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white border border-[#244B56] text-[#244B56] hover:bg-[#244B56]/5 font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <QrCode className="w-4 h-4" />
              <span>Gerar Cobrança PIX (R$ 299,00)</span>
            </button>
          </div>
        </div>

        {/* Card Plano IA */}
        <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
          selectedPlanId === 'ia'
            ? 'bg-[#172B3A] text-white border-[#C9A96E] ring-2 ring-[#C9A96E]/40 shadow-lg'
            : 'bg-[#172B3A] text-white border-transparent'
        }`}>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-[#C9A96E] uppercase tracking-wider">Completo com IA</span>
                <h3 className="text-lg font-bold text-white mt-0.5">LEX FLOW IA</h3>
              </div>
              <span className="text-lg font-bold text-white">R$ 499,00<span className="text-xs text-gray-300 font-normal">/mês</span></span>
            </div>

            <p className="mt-2 text-xs text-gray-300">
              Atendimento automático 24/7 com inteligência artificial treinada com as regras do seu negócio e transbordo humano.
            </p>

            <div className="mt-5 space-y-2 text-xs text-gray-200">
              {PLANS.ia.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => handleGeneratePix('ia')}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-semibold text-xs border border-[#C9A96E] shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <QrCode className="w-4 h-4 text-[#C9A96E]" />
              <span>Gerar Cobrança PIX (R$ 499,00)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Área de Pagamento PIX com QR Code do Efí Bank */}
      {currentCharge && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#244B56] text-[#C9A96E] flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172B3A]">
                  Cobrança PIX Gerada — Efí Bank
                </h3>
                <p className="text-[11px] text-gray-500">
                  Plano: {PLANS[currentCharge.planId].name} • Valor: R$ {(currentCharge.amountCents / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                currentCharge.status === 'CONCLUIDA'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {currentCharge.status === 'CONCLUIDA' ? 'PAGAMENTO CONFIRMADO' : 'AGUARDANDO PAGAMENTO'}
              </span>
            </div>
          </div>

          {currentCharge.status === 'PENDENTE' ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-[#F8F6F0] rounded-xl border border-gray-200">
                {currentCharge.qrCodeBase64 ? (
                  <img
                    src={currentCharge.qrCodeBase64}
                    alt="QR Code PIX Efí Bank"
                    className="w-52 h-52 rounded-lg bg-white p-2 shadow-xs"
                  />
                ) : (
                  <div className="w-52 h-52 bg-white flex items-center justify-center text-xs text-gray-400">
                    QR Code Indisponível
                  </div>
                )}
                <span className="text-[11px] text-gray-500 mt-2 font-mono">
                  txid: {currentCharge.txid}
                </span>
              </div>

              {/* Instruções e Copia e Cola */}
              <div className="space-y-4 text-xs">
                <div>
                  <p className="font-semibold text-[#172B3A]">Como pagar:</p>
                  <ol className="list-decimal list-inside text-gray-600 mt-1 space-y-1 text-[11px]">
                    <li>Abra o aplicativo do seu banco ou internet banking.</li>
                    <li>Escolha a opção <strong>PIX</strong> e selecione <strong>Pagar com QR Code</strong> ou <strong>Copia e Cola</strong>.</li>
                    <li>Escaneie o QR Code ao lado ou copie o código abaixo.</li>
                    <li>Confirme o pagamento de R$ {(currentCharge.amountCents / 100).toFixed(2)}.</li>
                    <li>A confirmação será recebida automaticamente via webhook do Efí Bank.</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                    PIX Copia e Cola Oficial:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentCharge.copiaECola}
                      className="flex-1 px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-gray-700 font-mono text-[10px] select-all"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-3 py-2 rounded-lg bg-[#244B56] text-white hover:bg-[#1a3840] font-medium text-xs flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#C9A96E]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Botão de homologação / teste controlado */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    Válido por 60 minutos
                  </span>

                  <button
                    onClick={handleTestSimulatePayment}
                    className="text-[11px] font-medium text-[#244B56] hover:underline"
                    title="Simula a confirmação do webhook do Efí Bank para testes rápidos"
                  >
                    Simular Confirmação Bancária (Teste)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-emerald-900">
                Pagamento confirmado com sucesso!
              </h4>
              <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                Sua assinatura do plano <strong>{PLANS[currentCharge.planId].name}</strong> foi ativada.
                EndToEndId: {currentCharge.efiEndToEndId || 'E99999999'}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Seção Informativa de Segurança Financeira Efí Bank */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-2">
        <div className="flex items-center gap-2 text-[#172B3A] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#244B56]" />
          <span>Segurança Financeira e Boas Práticas — Efí Bank</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Nenhuma credencial bancária sensível (Client Secret, certificado mTLS ou chaves privadas) trafega pelo frontend. As cobranças e confirmações ocorrem estritamente de servidor para servidor, com autenticação mTLS e verificação criptográfica de webhooks para garantir a total integridade das transações.
        </p>
      </div>
    </div>
  );
};

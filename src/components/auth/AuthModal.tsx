import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Clock
} from 'lucide-react';
import { Tenant, User as UserType } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'register' | 'login';
  onClose: () => void;
  onSuccess: (tenant: Tenant, user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'register' | 'login' | 'onboarding'>(initialMode);
  
  // Registration fields
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Onboarding wizard state
  const [registeredTenant, setRegisteredTenant] = useState<Tenant | null>(null);
  const [registeredUser, setRegisteredUser] = useState<UserType | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [wabaId, setWabaId] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Por favor, verifique.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('É obrigatório marcar o aceite dos termos de uso e política de privacidade.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          companyName,
          email,
          phone,
          password,
          termsAccepted
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      setRegisteredTenant(data.tenant);
      setRegisteredUser(data.user);
      setWhatsappPhone(phone || '+55 11 98452-1920');
      setMode('onboarding');
      setOnboardingStep(1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      onSuccess(data.tenant, data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!registeredTenant || !registeredUser) return;
    setLoading(true);

    try {
      await fetch('/api/tenants/current/whatsapp-connect', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': registeredTenant.id
        },
        body: JSON.stringify({
          phoneNumber: whatsappPhone,
          wabaId: wabaId || 'WABA_DEFAULT_OFFICIAL'
        })
      });

      registeredTenant.whatsappConnected = true;
      registeredTenant.whatsappPhoneNumber = whatsappPhone;

      onSuccess(registeredTenant, registeredUser);
      onClose();
    } catch (err) {
      onSuccess(registeredTenant, registeredUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs font-['Inter',sans-serif] overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* CABEÇALHO COM MÁXIMA LEGIBILIDADE */}
        <div className="bg-[#172B3A] text-white p-5 sm:p-6 border-b-2 border-[#C9A96E]/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Ícone com Destaque Dourado */}
              <div className="w-12 h-12 rounded-xl bg-[#244B56] border-2 border-[#C9A96E] flex items-center justify-center text-[#C9A96E] shadow-md shrink-0">
                <MessageSquare className="w-6 h-6 stroke-[2.5]" />
              </div>
              
              <div>
                {/* LOGO LEX FLOW EM DESTAQUE E ALTO CONTRASTE */}
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white drop-shadow-xs">
                    LEX
                  </span>
                  <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#E5C384] drop-shadow-xs">
                    FLOW
                  </span>
                </div>
                
                {/* SUBTÍTULO NÍTIDO E LEGÍVEL */}
                <p className="text-sm sm:text-base font-semibold text-white/95 mt-0.5 tracking-wide">
                  {mode === 'onboarding'
                    ? 'Assistente de Configuração Inicial'
                    : mode === 'register'
                    ? 'Cadastro Comercial & Teste Grátis de 7 Dias'
                    : 'Acesso à Plataforma'}
                </p>
              </div>
            </div>

            {/* Botão Fechar com Excelente Alvo de Toque */}
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Fechar"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* MENSAGEM DE ERRO COM ALTA VISIBILIDADE */}
        {errorMessage && (
          <div className="mx-6 mt-5 p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODO CADASTRO COMERCIAL */}
        {/* ============================================================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="p-6 sm:p-7 space-y-5">
            {/* Aviso de Teste de 7 Dias em Destaque */}
            <div className="bg-[#F8F6F0] p-4 rounded-xl border-2 border-[#C9A96E]/40 flex items-start sm:items-center gap-3 text-[#172B3A]">
              <div className="p-1.5 bg-[#244B56] text-[#C9A96E] rounded-lg shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#172B3A] leading-relaxed">
                Seu teste de <strong className="font-bold text-[#172B3A]">7 dias corridos</strong> começará imediatamente com limite do plano IA incluso.
              </p>
            </div>

            {/* Linha 1: Nome do Responsável & Nome da Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1.5 tracking-wide">
                  Nome do Responsável <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Eduardo Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1.5 tracking-wide">
                  Nome da Empresa ou Escritório <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vance Consultoria"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                />
              </div>
            </div>

            {/* Linha 2: E-mail Comercial & Telefone / WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1.5 tracking-wide">
                  E-mail Comercial <span className="text-amber-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contato@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1.5 tracking-wide">
                  Telefone / WhatsApp <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+55 11 98452-1920"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium font-mono focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                />
              </div>
            </div>

            {/* Linha 3: Senha de Acesso & Confirmação de Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1.5 tracking-wide">
                  Senha de Acesso <span className="text-amber-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#172B3A] mb-1.5 tracking-wide">
                  Confirmação de Senha <span className="text-amber-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                />
              </div>
            </div>

            {/* Checkbox Termos de Uso */}
            <div className="flex items-start gap-3 pt-1 bg-[#F8F6F0]/80 p-3.5 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 accent-[#244B56] rounded mt-0.5 shrink-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug cursor-pointer select-none">
                Declaro que li e concordo com os Termos de Uso e a Política de Privacidade e Proteção de Dados (LGPD) do LEX FLOW.
              </label>
            </div>

            {/* Botão de Envio Principal com hover dourado #C9A96E */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-[#244B56] hover:bg-[#C9A96E] text-white hover:text-[#172B3A] font-semibold text-sm sm:text-base border-2 border-[#C9A96E] shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 cursor-pointer active:scale-[0.99] group"
            >
              <span className="tracking-wide group-hover:font-bold transition-all">{loading ? 'Criando sua conta...' : 'Cadastrar e Começar Teste de 7 Dias'}</span>
              <ArrowRight className="w-5 h-5 text-[#E5C384] group-hover:translate-x-1 group-hover:text-[#172B3A] transition-all" />
            </button>

            {/* Alternar para Login */}
            <div className="text-center pt-3 border-t border-gray-200">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">Já possui uma conta? </span>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className="text-[#244B56] font-bold text-xs sm:text-sm hover:underline hover:text-[#172B3A]"
              >
                Faça login
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* MODO LOGIN */}
        {/* ============================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="p-6 sm:p-7 space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#172B3A] mb-1.5">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                required
                placeholder="seu.email@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#172B3A] mb-1.5">
                Sua Senha
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] placeholder:text-gray-400 font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-bold text-sm sm:text-base border-2 border-[#C9A96E] shadow-lg flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              <span>{loading ? 'Autenticando...' : 'Entrar no Lex Flow'}</span>
              <ArrowRight className="w-5 h-5 text-[#E5C384]" />
            </button>

            <div className="text-center pt-3 border-t border-gray-200">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">Ainda não tem conta? </span>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className="text-[#244B56] font-bold text-xs sm:text-sm hover:underline hover:text-[#172B3A]"
              >
                Cadastre sua empresa e teste por 7 dias
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* ASSISTENTE DE CONFIGURAÇÃO INICIAL (ONBOARDING) */}
        {/* ============================================================== */}
        {mode === 'onboarding' && (
          <div className="p-6 sm:p-7 space-y-6">
            {/* Steps indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  onboardingStep >= 1 ? 'bg-[#244B56] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </span>
                <span className="font-bold text-xs sm:text-sm text-gray-800">Empresa Cadastrada</span>
              </div>
              <div className="w-10 h-0.5 bg-gray-300" />
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  onboardingStep >= 2 ? 'bg-[#244B56] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </span>
                <span className="font-bold text-xs sm:text-sm text-gray-800">WhatsApp Business</span>
              </div>
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    Conta registrada com sucesso no servidor!
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-emerald-800 leading-relaxed">
                    Empresa: <strong>{registeredTenant?.name}</strong> • Período de teste válido até{' '}
                    <strong>
                      {registeredTenant?.trialEndsAt
                        ? new Date(registeredTenant.trialEndsAt).toLocaleDateString('pt-BR')
                        : '7 dias'}
                    </strong>.
                  </p>
                </div>

                <div className="p-4 bg-[#F8F6F0] rounded-xl border border-gray-200 space-y-2.5 text-xs sm:text-sm">
                  <p className="font-bold text-[#172B3A]">Etapas de configuração:</p>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Conta criada e usuário responsável associado.</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Assinatura de teste de 7 dias ativada com timestamp de servidor.</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-800 font-medium">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Pendente: Conectar o número de WhatsApp Business da empresa.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-bold text-sm sm:text-base border-2 border-[#C9A96E] shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <span>Avançar para Conectar WhatsApp</span>
                  <ArrowRight className="w-5 h-5 text-[#E5C384]" />
                </button>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-[#F8F6F0] rounded-xl border border-gray-200">
                  <p className="font-bold text-sm sm:text-base text-[#172B3A]">Conectar WhatsApp Business Oficial</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Informe o número cadastrado na Meta para receber webhooks em tempo real no seu painel.
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#172B3A] mb-1.5">
                    Número do WhatsApp da Empresa com DDD
                  </label>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="+55 11 98452-1920"
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] font-mono font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#172B3A] mb-1.5">
                    ID da Conta do WhatsApp Business (Opcional)
                  </label>
                  <input
                    type="text"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="WABA_1092837465"
                    className="w-full px-3.5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base text-[#172B3A] font-mono font-medium focus:outline-none focus:border-[#244B56] focus:ring-4 focus:ring-[#244B56]/15 transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-bold text-sm sm:text-base border-2 border-[#C9A96E] shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#E5C384]" />
                  <span>{loading ? 'Salvando...' : 'Concluir e Acessar o Painel de Atendimento'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

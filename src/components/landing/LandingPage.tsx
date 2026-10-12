import React, { useState } from 'react';
import { 
  MessageSquare, 
  Bot, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  UserCheck, 
  Clock, 
  HelpCircle,
  ChevronDown,
  Building2,
  Smartphone
} from 'lucide-react';

interface LandingPageProps {
  onStartTrial: () => void;
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial,
  onLoginClick,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Como funciona o teste grátis de 7 dias?',
      a: 'Você cadastra os dados da sua empresa e tem acesso imediato à plataforma pelo período de 7 dias corridos, sem necessidade de cadastrar cartão de crédito. Durante o teste você pode conectar seu WhatsApp e experimentar todos os recursos da ferramenta.'
    },
    {
      q: 'Qual a diferença entre o plano Essencial e o plano IA?',
      a: 'O plano LEX FLOW ESSENCIAL (R$ 299/mês) é voltado para atendimento humano unificado, com múltiplos atendentes, histórico de clientes e relatórios. O plano LEX FLOW IA (R$ 499/mês) inclui tudo isso mais nosso Agente de IA para responder dúvidas frequentes 24/7 e fazer triagem com transbordo inteligente para humanos.'
    },
    {
      q: 'Como é feito o pagamento após o teste?',
      a: 'Os pagamentos são processados via PIX através da infraestrutura oficial do Efí Bank. Você gera o QR Code no próprio painel e a ativação ou renovação do plano ocorre de forma automática e imediata após a confirmação bancária.'
    },
    {
      q: 'O que acontece quando o período de teste termina?',
      a: 'Ao final dos 7 dias, caso não contrate um plano, o acesso ao painel de envio fica pausado até a confirmação do pagamento. Suas conversas, clientes e configurações não são apagadas automaticamente, respeitando as políticas de retenção da plataforma.'
    },
    {
      q: 'Se um cliente pedir para falar com uma pessoa, a IA transfere?',
      a: 'Sim. O LEX FLOW possui detecção de intenção. Sempre que o cliente solicita atendente humano ou expressa uma dúvida sensível, a IA envia a mensagem de transbordo e suspende a automação naquela conversa para que a equipe humana assuma o controle.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#172B3A] flex flex-col font-['Inter',sans-serif]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#172B3A] text-white border-b border-[#244B56] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo Textual LEX FLOW */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#244B56] border-2 border-[#C9A96E] flex items-center justify-center text-[#E5C384] shadow-md">
              <MessageSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-xs">LEX</span>
              <span className="font-extrabold text-2xl tracking-tight text-[#E5C384] drop-shadow-xs">FLOW</span>
            </div>
          </div>

          {/* Menu Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-200">
            <a href="#recursos" className="hover:text-[#C9A96E] transition-colors">Recursos</a>
            <a href="#como-funciona" className="hover:text-[#C9A96E] transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-[#C9A96E] transition-colors">Planos</a>
            <a href="#faq" className="hover:text-[#C9A96E] transition-colors">Perguntas frequentes</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="text-sm font-medium text-gray-200 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={onStartTrial}
              className="px-4 py-2 rounded-lg bg-[#244B56] hover:bg-[#1a3840] text-white font-medium text-sm border border-[#C9A96E]/50 shadow-sm flex items-center gap-2 transition-all"
            >
              <span>Começar teste grátis</span>
              <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-gradient-to-b from-[#172B3A] via-[#1b3244] to-[#F8F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#244B56]/60 border border-[#C9A96E]/40 text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" /> Plataforma de Atendimento e Automação Empresarial
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Seu WhatsApp organizado.<br />
            <span className="text-[#C9A96E]">Seu atendimento sob controle.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Centralize conversas, acompanhe seus clientes e automatize o atendimento com inteligência artificial quando precisar.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-semibold text-sm border border-[#C9A96E] shadow-lg flex items-center justify-center gap-2.5 transition-all group"
            >
              <span>Começar teste grátis de 7 dias</span>
              <ArrowRight className="w-4 h-4 text-[#C9A96E] group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onLoginClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs transition-colors"
            >
              Acessar minha conta
            </button>
          </div>

          <p className="mt-3.5 text-xs text-gray-300 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
            Sem cartão de crédito no cadastro • 7 dias corridos de teste
          </p>
        </div>
      </section>

      {/* Seção de Recursos / Benefícios */}
      <section id="recursos" className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] tracking-tight">
              Tudo o que sua empresa precisa para atender com rapidez e precisão
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Elimine o caos das mensagens perdidas em aparelhos individuais e ganhe visibilidade total sobre o seu fluxo de clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#F8F6F0] border border-gray-200/80">
              <div className="w-10 h-10 rounded-lg bg-[#244B56] text-[#C9A96E] flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Central de Atendimento WhatsApp</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Conecte seu número oficial da WhatsApp Business Platform e atenda múltiplos clientes em uma interface organizada e profissional.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F6F0] border border-gray-200/80">
              <div className="w-10 h-10 rounded-lg bg-[#172B3A] text-[#C9A96E] flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Histórico Organizado de Conversas</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Todas as mensagens, envios e interações ficam centralizadas por cliente, garantindo que nenhum contato ou histórico seja perdido.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F6F0] border border-gray-200/80">
              <div className="w-10 h-10 rounded-lg bg-[#244B56] text-[#C9A96E] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Controle de Mensagens e Status</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Acompanhe em tempo real as conversas não lidas, pendentes e finalizadas, além dos status de envio e entrega fornecidos pela API oficial.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F6F0] border border-gray-200/80">
              <div className="w-10 h-10 rounded-lg bg-[#172B3A] text-[#C9A96E] flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Relatórios de Atendimento</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Métricas reais de volume de mensagens recebidas, respondidas, clientes cadastrados e consumo de automação para tomada de decisão.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F6F0] border border-gray-200/80">
              <div className="w-10 h-10 rounded-lg bg-[#244B56] text-[#C9A96E] flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Agente de IA Opcional</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Ative o agente com um clique para responder dúvidas frequentes, informar horários e realizar a triagem inicial com as diretrizes da sua empresa.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F6F0] border border-gray-200/80">
              <div className="w-10 h-10 rounded-lg bg-[#172B3A] text-[#C9A96E] flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Transferência para Atendentes Humanos</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Transbordo inteligente: a automação é pausada automaticamente assim que um atendente assume a conversa ou o cliente solicita contato humano.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona em 3 Passos */}
      <section id="como-funciona" className="py-20 bg-[#F8F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#244B56] uppercase tracking-wider">Passo a Passo</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] tracking-tight mt-1">
              Como funciona em 3 passos simples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-xs relative">
              <span className="text-4xl font-bold text-[#C9A96E]/40 absolute top-5 right-6 font-mono">01</span>
              <div className="w-11 h-11 rounded-xl bg-[#172B3A] text-white flex items-center justify-center mb-5 font-semibold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Cadastre sua empresa</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Crie sua conta em menos de 2 minutos. Seu teste de 7 dias é iniciado imediatamente no servidor, com data exata de término exibida no painel.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-xs relative">
              <span className="text-4xl font-bold text-[#C9A96E]/40 absolute top-5 right-6 font-mono">02</span>
              <div className="w-11 h-11 rounded-xl bg-[#244B56] text-white flex items-center justify-center mb-5 font-semibold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Conecte seu WhatsApp Business</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Vincule seu número pelo assistente de configuração oficial da Meta. O webhook receberá as mensagens em tempo real no seu painel.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-xs relative">
              <span className="text-4xl font-bold text-[#C9A96E]/40 absolute top-5 right-6 font-mono">03</span>
              <div className="w-11 h-11 rounded-xl bg-[#172B3A] text-white flex items-center justify-center mb-5 font-semibold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-[#172B3A]">Organize e Automatize</h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Organize as filas de atendimento e, caso contrate o plano IA, ative o atendimento automático com suas perguntas frequentes e instruções.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos e Preços */}
      <section id="planos" className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] tracking-tight">
              Planos transparentes e sem surpresas
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Escolha o plano ideal para a sua operação. Pagamento mensal via PIX com ativação automática.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Essencial */}
            <div className="bg-[#F8F6F0] rounded-2xl p-8 border border-gray-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Atendimento Humano</span>
                <h3 className="text-xl font-bold text-[#172B3A] mt-1">LEX FLOW ESSENCIAL</h3>
                <p className="text-xs text-gray-600 mt-2">
                  Ideal para empresas que desejam centralizar o atendimento da equipe em um único WhatsApp organizado.
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-[#172B3A]">R$ 299,00</span>
                  <span className="text-xs text-gray-500 font-medium">/ mês</span>
                </div>

                <div className="mt-8 space-y-3 text-xs text-gray-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#244B56] shrink-0" />
                    <span>Central de atendimento WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#244B56] shrink-0" />
                    <span>Lista e histórico completo de conversas</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#244B56] shrink-0" />
                    <span>Cadastro básico e histórico de clientes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#244B56] shrink-0" />
                    <span>Controle de mensagens não lidas</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#244B56] shrink-0" />
                    <span>Confirmação de envio e entrega via API</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#244B56] shrink-0" />
                    <span>Relatórios e métricas de atendimento</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#244B56] shrink-0" />
                    <span>Gestão de equipe e atendentes</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span className="line-through">Agente de IA respondendo automaticamente</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartTrial}
                className="mt-8 w-full py-3 rounded-xl bg-white hover:bg-gray-50 text-[#172B3A] font-semibold text-xs border border-gray-300 shadow-2xs transition-colors"
              >
                Testar Grátis por 7 Dias
              </button>
            </div>

            {/* Plano IA */}
            <div className="bg-[#172B3A] text-white rounded-2xl p-8 border-2 border-[#C9A96E] shadow-xl flex flex-col justify-between relative">
              <span className="absolute -top-3.5 right-6 bg-[#C9A96E] text-[#172B3A] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Mais Completo
              </span>

              <div>
                <span className="text-xs font-semibold text-[#C9A96E] uppercase tracking-wider">Com Inteligência Artificial</span>
                <h3 className="text-xl font-bold text-white mt-1">LEX FLOW IA</h3>
                <p className="text-xs text-gray-300 mt-2">
                  Atendimento automático 24/7, respostas inteligentes com base nas regras do seu negócio e transbordo humano.
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">R$ 499,00</span>
                  <span className="text-xs text-gray-300 font-medium">/ mês</span>
                </div>

                <div className="mt-8 space-y-3 text-xs text-gray-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span className="font-semibold text-white">Tudo incluído no plano Essencial</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Agente de IA para atendimento automático</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Respostas a perguntas frequentes configuráveis</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Triagem inicial inteligente de mensagens</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Identificação de solicitações para atendimento humano</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Encaminhamento automático e pausa da IA</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Configuração de instruções, FAQs e horários</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0" />
                    <span>Indicadores de utilização e consumo de IA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartTrial}
                className="mt-8 w-full py-3 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-semibold text-xs border border-[#C9A96E] shadow-md transition-colors"
              >
                Começar Teste com IA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#F8F6F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] tracking-tight">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-semibold text-[#172B3A] hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-[#172B3A] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Pronto para colocar seu WhatsApp sob controle?
          </h2>
          <p className="mt-4 text-sm text-gray-300 max-w-xl mx-auto">
            Cadastre sua empresa agora e experimente a plataforma completa por 7 dias. Sem burocracia e sem cartão no cadastro.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={onStartTrial}
              className="px-8 py-3.5 rounded-xl bg-[#244B56] hover:bg-[#1a3840] text-white font-semibold text-sm border border-[#C9A96E] shadow-xl flex items-center gap-2"
            >
              <span>Cadastre sua empresa e comece o teste</span>
              <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
            </button>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-[#0f1d27] text-gray-400 py-10 border-t border-[#244B56]/50 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <span>LEX FLOW</span>
            <span className="text-gray-500">• Automação e Atendimento Empresarial no WhatsApp</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <span>Termos de Uso</span>
            <span>Política de Privacidade</span>
            <span>LGPD e Segurança</span>
          </div>
          <p className="text-gray-500">© 2026 Lex Flow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

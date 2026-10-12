import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Check, 
  CheckCheck, 
  PauseCircle, 
  PlayCircle, 
  Phone, 
  Mail, 
  Tag, 
  Info,
  Clock,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2
} from 'lucide-react';
import { Conversation, Message, Tenant } from '../../types';

interface WhatsAppModuleProps {
  conversations: Conversation[];
  selectedConversationId: string;
  onSelectConversation: (id: string) => void;
  messages: Message[];
  onSendMessage: (conversationId: string, text: string) => void;
  onToggleAiConversation: (conversationId: string) => void;
  onUpdateStatus: (conversationId: string, status: 'aberta' | 'aguardando' | 'finalizada') => void;
  tenant: Tenant | null;
  onOpenNovaConversa?: () => void;
  onClearConversations?: () => void;
}

export const WhatsAppModule: React.FC<WhatsAppModuleProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  messages,
  onSendMessage,
  onToggleAiConversation,
  onUpdateStatus,
  tenant,
  onOpenNovaConversa,
  onClearConversations,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [search, setSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const [showDossier, setShowDossier] = useState(true);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const matchQuery = 
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerPhone.includes(search) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());

    if (!matchQuery) return false;
    if (filterStatus === 'todas') return true;
    if (filterStatus === 'nao_lidas') return c.unreadCount > 0;
    if (filterStatus === 'abertas') return c.status === 'aberta';
    if (filterStatus === 'finalizadas') return c.status === 'finalizada';
    return true;
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;
    onSendMessage(selectedConversation.id, inputText.trim());
    setInputText('');
  };

  const quickReplies = [
    'Olá! Como posso ajudar você hoje?',
    'Aguarde só um momento enquanto localizo seu cadastro em nosso sistema.',
    'Perfeito! Seu agendamento foi confirmado para a data solicitada.',
    'Agradecemos o seu contato. Tenha um excelente dia!'
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-[#F8F6F0]">
      <div className="flex-1 flex overflow-hidden">
        {/* COLUNA 1: Lista de Conversas */}
        <div className="w-full sm:w-80 md:w-96 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-[#172B3A] uppercase tracking-wider flex items-center gap-1.5">
                <span>Conversas</span>
                <span className="text-[11px] font-normal text-gray-500">({conversations.length})</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>API Conectada</span>
                </div>
                {conversations.length > 0 && onClearConversations && (
                  <button
                    onClick={onClearConversations}
                    title="Limpar histórico de conversas do sistema"
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Input de Busca */}
            <div className="relative mb-2.5">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#244B56]"
              />
            </div>

            {/* Filtros de Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setFilterStatus('todas')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === 'todas'
                    ? 'bg-[#172B3A] text-white'
                    : 'bg-[#F8F6F0] text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('nao_lidas')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === 'nao_lidas'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#F8F6F0] text-red-600 hover:bg-red-50'
                }`}
              >
                Não Lidas
              </button>
              <button
                onClick={() => setFilterStatus('abertas')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === 'abertas'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#F8F6F0] text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Abertas
              </button>
              <button
                onClick={() => setFilterStatus('finalizadas')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === 'finalizadas'
                    ? 'bg-gray-700 text-white'
                    : 'bg-[#F8F6F0] text-gray-600 hover:bg-gray-200'
                }`}
              >
                Finalizadas
              </button>
            </div>
          </div>

          {/* Itens de Conversa */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-[#244B56]/5 text-[#244B56] flex items-center justify-center mb-2.5">
                  <MessageSquare className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="font-semibold text-gray-700">Nenhuma conversa encontrada</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                  {conversations.length === 0
                    ? 'Aguardando novas mensagens recebidas pelo WhatsApp oficial.'
                    : 'Nenhum resultado para os filtros selecionados.'}
                </p>
                {onOpenNovaConversa && (
                  <button
                    onClick={onOpenNovaConversa}
                    className="mt-3.5 px-3 py-1.5 rounded-lg bg-[#244B56] text-white hover:bg-[#1a3840] font-medium text-[11px] flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Iniciar Conversa</span>
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConversation?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`p-3.5 cursor-pointer transition-colors relative flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#F8F6F0] border-l-4 border-[#244B56]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#172B3A] text-[#C9A96E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#C9A96E]/30">
                      {conv.customerName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-[#172B3A]' : 'font-semibold text-gray-800'}`}>
                          {conv.customerName}
                        </h3>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <p className={`text-[11px] truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-medium text-[#172B3A]' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                        <span className="text-[10px] text-gray-400">{conv.customerPhone}</span>
                        <div className="flex items-center gap-1.5">
                          {conv.aiPaused && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Humano
                            </span>
                          )}
                          {conv.unreadCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                              {conv.unreadCount}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium capitalize">
                              {conv.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA 2: Chat em Tempo Real */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-[#F8F6F0] overflow-hidden">
            {/* Header da Conversa Ativa */}
            <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#172B3A] text-[#C9A96E] flex items-center justify-center font-bold text-xs border border-[#C9A96E]/30">
                  {selectedConversation.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#172B3A]">
                      {selectedConversation.customerName}
                    </h3>
                    <span className="text-xs text-gray-500">{selectedConversation.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span className="text-emerald-700 font-medium">WhatsApp Conectado</span>
                    <span>•</span>
                    <span>Atribuído a: {selectedConversation.assignedAgentName || 'Central'}</span>
                  </div>
                </div>
              </div>

              {/* Controles de Atendimento e IA */}
              <div className="flex items-center gap-2">
                {tenant?.planId === 'ia' && (
                  <button
                    onClick={() => onToggleAiConversation(selectedConversation.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      selectedConversation.aiPaused
                        ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    }`}
                    title="Alternar controle entre automação e atendente humano nesta conversa"
                  >
                    {selectedConversation.aiPaused ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>IA Pausada (Atendente Humano)</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>IA Ativa (Pausar p/ Atendente)</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => onUpdateStatus(
                    selectedConversation.id, 
                    selectedConversation.status === 'aberta' ? 'finalizada' : 'aberta'
                  )}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#172B3A] text-xs font-medium transition-colors"
                >
                  {selectedConversation.status === 'aberta' ? 'Finalizar Atendimento' : 'Reabrir Conversa'}
                </button>

                <button
                  onClick={() => setShowDossier(!showDossier)}
                  className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                    showDossier ? 'bg-[#244B56] text-white border-[#244B56]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  title="Ficha do Cliente"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#F8F6F0]">
              <div className="flex justify-center">
                <span className="text-[10px] font-medium text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                  Conversa Oficial Sincronizada via WhatsApp Cloud API
                </span>
              </div>

              {messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isAi = msg.sender === 'ai';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed ${
                        isCustomer
                          ? 'bg-white text-[#172B3A] border border-gray-200 rounded-bl-none'
                          : isAi
                          ? 'bg-[#172B3A] text-white border border-[#244B56] rounded-br-none'
                          : 'bg-[#244B56] text-white border border-[#244B56] rounded-br-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`text-[10px] font-bold ${
                          isCustomer
                            ? 'text-[#244B56]'
                            : isAi
                            ? 'text-[#C9A96E] flex items-center gap-1'
                            : 'text-gray-200'
                        }`}>
                          {isAi && <Bot className="w-3 h-3" />}
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] opacity-60">{msg.timestamp}</span>
                      </div>

                      <p>{msg.text}</p>

                      {!isCustomer && (
                        <div className="flex justify-end mt-1 text-gray-300">
                          {msg.status === 'read' ? (
                            <span title="Lida"><CheckCheck className="w-3.5 h-3.5 text-[#C9A96E]" /></span>
                          ) : msg.status === 'delivered' ? (
                            <span title="Entregue"><CheckCheck className="w-3.5 h-3.5 opacity-60" /></span>
                          ) : (
                            <span title="Enviada"><Check className="w-3.5 h-3.5 opacity-60" /></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Respostas Rápidas */}
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-semibold text-gray-400 shrink-0">Respostas rápidas:</span>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(reply)}
                  className="px-2.5 py-1 rounded-md bg-[#F8F6F0] hover:bg-gray-200 text-[#172B3A] text-[11px] truncate shrink-0 max-w-xs transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Barra de Digitação */}
            <div className="p-3.5 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua mensagem para o cliente (Pressione Enter para enviar)..."
                  className="flex-1 px-4 py-2 text-xs bg-[#F8F6F0] border border-gray-200 rounded-xl text-[#172B3A] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#244B56]"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#244B56] text-white hover:bg-[#1a3840] font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <span>Enviar</span>
                  <Send className="w-3.5 h-3.5 text-[#C9A96E]" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8F6F0]">
            <div className="max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#244B56]/10 text-[#244B56] flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-[#172B3A]">
                Nenhuma conversa ativa no momento
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                A central de atendimento está conectada e operando em tempo real. As mensagens recebidas pelo seu WhatsApp Business oficial aparecerão aqui instantaneamente.
              </p>
              {onOpenNovaConversa && (
                <button
                  onClick={onOpenNovaConversa}
                  className="mt-5 px-4 py-2 rounded-xl bg-[#244B56] text-white hover:bg-[#1a3840] font-semibold text-xs flex items-center gap-2 shadow-xs transition-all border border-[#C9A96E]/40"
                >
                  <Plus className="w-4 h-4 text-[#C9A96E]" />
                  <span>Iniciar Nova Conversa</span>
                </button>
              )}
              <div className="mt-5 p-3 rounded-xl bg-[#F8F6F0] border border-gray-200 text-[11px] text-gray-600 w-full text-left flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>WhatsApp Business API: <strong>Sincronizada e pronta</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* COLUNA 3: Dossiê Lateral do Cliente */}
        {selectedConversation && showDossier && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto hidden xl:flex">
            <div className="p-4 border-b border-gray-200 bg-[#172B3A] text-white">
              <span className="text-[10px] font-bold text-[#C9A96E] uppercase tracking-wider">
                Ficha do Cliente
              </span>
              <h4 className="text-sm font-bold text-white mt-1">{selectedConversation.customerName}</h4>
              <p className="text-xs text-gray-300">{selectedConversation.customerPhone}</p>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div>
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-2">
                  Dados de Contato
                </p>
                <div className="bg-[#F8F6F0] p-3 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-3.5 h-3.5 text-[#244B56]" />
                    <span>{selectedConversation.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-[#244B56]" />
                    <span>Último contato: {selectedConversation.lastMessageTime}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-2">
                  Status da Automação
                </p>
                <div className="bg-[#F8F6F0] p-3 rounded-xl border border-gray-200 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Agente de IA:</span>
                    <span className="font-bold text-[#172B3A]">
                      {selectedConversation.aiPaused ? 'Pausado (Humano)' : 'Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status da Conversa:</span>
                    <span className="font-semibold text-emerald-700 capitalize">
                      {selectedConversation.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-2">
                  Etiquetas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#244B56]/10 text-[#244B56]">
                    WhatsApp Oficial
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                    Lead Ativo
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

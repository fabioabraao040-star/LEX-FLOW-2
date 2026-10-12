import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';

interface NovaConversaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewChat: (name: string, phone: string, initialMessage: string) => void;
}

export const NovaConversaModal: React.FC<NovaConversaModalProps> = ({
  isOpen,
  onClose,
  onStartNewChat,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+55 11 9');
  const [message, setMessage] = useState('Olá! Aqui é da equipe de atendimento. Como podemos te ajudar hoje?');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    onStartNewChat(name.trim(), phone.trim(), message.trim());
    setName('');
    setPhone('+55 11 9');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-['Inter',sans-serif]">
      <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl p-6 text-xs animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#244B56] text-[#C9A96E] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">Iniciar Atendimento no WhatsApp</h3>
              <p className="text-[11px] text-gray-500">Envio oficial via WhatsApp Business API</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
              Nome do Cliente *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Mariana Silveira"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
              WhatsApp com DDD *
            </label>
            <input
              type="text"
              required
              placeholder="+55 11 98452-1920"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] font-mono focus:outline-none focus:ring-1 focus:ring-[#244B56]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
              Primeira Mensagem *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#244B56] hover:bg-[#1a3840] text-white font-semibold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Enviar Mensagem</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MessageSquare, 
  Tag, 
  User, 
  Check,
  Plus
} from 'lucide-react';
import { Customer } from '../../types';

interface ClientesModuleProps {
  customers: Customer[];
  onOpenChat: (customerPhone: string) => void;
  onAddCustomer: (customer: { name: string; phone: string; email: string; notes: string; tags: string[] }) => void;
}

export const ClientesModule: React.FC<ClientesModuleProps> = ({
  customers,
  onOpenChat,
  onAddCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      tags: tagInput ? tagInput.split(',').map((t) => t.trim()) : ['Cliente']
    });

    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setTagInput('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-[#F8F6F0]">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, telefone ou e-mail..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8F6F0] border border-gray-200 rounded-xl text-[#172B3A] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#244B56]"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#244B56] text-white hover:bg-[#1a3840] font-semibold text-xs shadow-xs transition-all"
        >
          <UserPlus className="w-4 h-4 text-[#C9A96E]" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#244B56]/10 text-[#244B56] flex items-center justify-center mb-3">
              <User className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-[#172B3A]">Base de Clientes Vazia</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Os contatos serão cadastrados automaticamente conforme entrarem em contato pelo WhatsApp, ou você pode cadastrar manualmente pelo botão acima.
            </p>
          </div>
        ) : (
          filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-[#244B56]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#172B3A] text-[#C9A96E] flex items-center justify-center font-bold text-xs border border-[#C9A96E]/30 shrink-0">
                      {cust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#172B3A]">{cust.name}</h3>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{cust.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  {cust.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#244B56]" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  )}
                  {cust.notes && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 bg-[#F8F6F0] p-2 rounded-lg">
                      {cust.notes}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cust.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F8F6F0] text-gray-700 border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => onOpenChat(cust.phone)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#244B56] text-white hover:bg-[#1a3840] font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>Conversar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Cadastro de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl p-6 text-xs animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#172B3A] mb-4">Novo Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  Telefone / WhatsApp com DDD *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+55 11 98452-1920"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  Etiquetas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Novo Lead, Particular, Retorno"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#172B3A] mb-1">
                  Notas de Atendimento
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais do cliente"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-200 rounded-lg text-[#172B3A] focus:outline-none focus:ring-1 focus:ring-[#244B56]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#244B56] hover:bg-[#1a3840] text-white font-semibold"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

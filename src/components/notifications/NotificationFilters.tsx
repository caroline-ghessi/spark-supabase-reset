
import React from 'react';

interface NotificationFiltersProps {
  filter: 'todas' | 'nao_lidas' | 'criticas' | 'hoje';
  typeFilter: 'todos_tipos' | 'clientes' | 'vendedores' | 'sistema' | 'ia';
  onFilterChange: (filter: 'todas' | 'nao_lidas' | 'criticas' | 'hoje') => void;
  onTypeFilterChange: (typeFilter: 'todos_tipos' | 'clientes' | 'vendedores' | 'sistema' | 'ia') => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  typeFilter,
  onFilterChange,
  onTypeFilterChange,
  unreadCount,
  onMarkAllAsRead
}) => {
  return (
    <>
      {/* Filters */}
      <div className="mt-3 flex space-x-2">
        <select 
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as any)}
          className="text-xs border rounded px-2 py-1 flex-1 bg-white"
        >
          <option value="todas">Todas</option>
          <option value="nao_lidas">Não Lidas</option>
          <option value="criticas">Críticas</option>
          <option value="hoje">Hoje</option>
        </select>
        
        <select 
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as any)}
          className="text-xs border rounded px-2 py-1 flex-1 bg-white"
        >
          <option value="todos_tipos">Todos</option>
          <option value="clientes">Clientes</option>
          <option value="vendedores">Vendedores</option>
          <option value="sistema">Sistema</option>
          <option value="ia">IA</option>
        </select>
      </div>
      
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
        >
          Marcar todas como lidas
        </button>
      )}
    </>
  );
};

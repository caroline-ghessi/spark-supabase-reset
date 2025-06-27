
import { Clock, Bot, User, UserCheck } from 'lucide-react';
import { Conversation } from '../../types/conversation';

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig = {
  bot: { icon: Bot, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Bot Ativo' },
  manual: { icon: User, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Manual' },
  seller: { icon: UserCheck, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Vendedor' },
  waiting: { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Aguardando' },
};

const leadTypeConfig = {
  hot: { emoji: '🔥', label: 'Quente', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  warm: { emoji: '🟡', label: 'Morno', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  cold: { emoji: '🔵', label: 'Frio', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
};

export const ConversationCard = ({ conversation, isSelected, onClick }: ConversationCardProps) => {
  const statusInfo = statusConfig[conversation.status as keyof typeof statusConfig];
  const leadInfo = leadTypeConfig[conversation.leadType as keyof typeof leadTypeConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-orange-500 bg-orange-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="font-medium text-gray-600">
              {conversation.clientName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Client Info */}
          <div>
            <h3 className="font-medium text-gray-900">{conversation.clientName}</h3>
            <p className="text-sm text-gray-500">{conversation.clientPhone}</p>
          </div>
        </div>

        {/* Status and Lead Type */}
        <div className="flex flex-col items-end space-y-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
            <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
            <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${leadInfo.bgColor} ${leadInfo.textColor}`}>
            {leadInfo.emoji} {leadInfo.label}
          </div>
        </div>
      </div>

      {/* Last Message */}
      <div className="mb-2">
        <p className="text-sm text-gray-600 line-clamp-2">{conversation.lastMessage}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{conversation.lastMessageTime}</span>
        <div className="flex items-center space-x-2">
          {conversation.unreadCount > 0 && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full min-w-[20px] text-center">
              {conversation.unreadCount}
            </span>
          )}
          {conversation.assignedSeller && (
            <span className="text-purple-600 font-medium">
              {conversation.assignedSeller}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

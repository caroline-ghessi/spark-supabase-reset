
import { Message } from '../../types/message';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isClient = message.sender === 'client';
  const isBot = message.sender === 'bot';
  const isOperator = message.sender === 'operator';
  const isSeller = message.sender === 'seller';
  
  const getBubbleColor = () => {
    if (isClient) return 'bg-orange-500 text-white';
    if (isBot) return 'bg-blue-100 text-blue-900 border border-blue-200';
    if (isOperator) return 'bg-green-100 text-green-900 border border-green-200';
    if (isSeller) return 'bg-purple-100 text-purple-900 border border-purple-200';
    return 'bg-gray-100 text-gray-900';
  };

  const getBubblePosition = () => {
    return isClient ? 'ml-auto rounded-br-sm' : 'mr-auto rounded-bl-sm';
  };

  const getSenderColor = () => {
    if (isBot) return 'text-blue-600';
    if (isOperator) return 'text-green-600';
    if (isSeller) return 'text-purple-600';
    return 'text-gray-600';
  };
  
  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-xs lg:max-w-md xl:max-w-lg">
        {/* Sender Name and Time */}
        <div className={`text-xs mb-1 ${isClient ? 'text-right' : 'text-left'}`}>
          <span className={`font-medium ${getSenderColor()}`}>
            {message.senderName}
          </span>
          <span className="text-gray-500 ml-2">{message.timestamp}</span>
        </div>
        
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${getBubbleColor()} ${getBubblePosition()}`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Message Status (for client messages) */}
        {isClient && (
          <div className="text-right mt-1">
            <span className="text-xs text-gray-400">Entregue ✓</span>
          </div>
        )}
      </div>
    </div>
  );
};

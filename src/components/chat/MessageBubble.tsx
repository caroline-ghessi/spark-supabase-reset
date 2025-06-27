
import { Message } from '../../types/message';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isClient = message.sender === 'client';
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
        {/* Sender Name */}
        <div className={`text-xs text-gray-500 mb-1 ${isClient ? 'text-right' : 'text-left'}`}>
          {message.senderName} • {message.timestamp}
        </div>
        
        {/* Message Bubble */}
        <div
          className={`px-4 py-2 rounded-lg ${
            isClient
              ? 'bg-orange-500 text-white rounded-br-sm'
              : isBot
              ? 'bg-blue-100 text-blue-900 rounded-bl-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

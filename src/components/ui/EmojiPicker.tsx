
import React, { useState, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Emojis organizados por categoria
const EMOJI_CATEGORIES = {
  frequentes: {
    label: 'Frequentes',
    emojis: ['😊', '👍', '❤️', '🙏', '😄', '🎉', '👏', '😍', '🤝', '✅', '💪', '🚀']
  },
  sorrisos: {
    label: 'Sorrisos',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔']
  },
  gestos: {
    label: 'Gestos',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏']
  },
  objetos: {
    label: 'Objetos',
    emojis: ['💼', '📁', '📂', '📅', '📆', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '📏', '📐', '✂️', '🖊️', '🖋️', '✒️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
  },
  simbolos: {
    label: 'Símbolos',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '⚡', '🔥', '💥', '❄️', '🌈', '☀️', '🌤️', '⛅', '☁️', '🌧️']
  },
  atividades: {
    label: 'Atividades',
    emojis: ['🎯', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩']
  }
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('frequentes');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    // Recuperar emojis recentes do localStorage
    try {
      const saved = localStorage.getItem('recentEmojis');
      return saved ? JSON.parse(saved) : ['😊', '👍', '❤️', '🙏'];
    } catch {
      return ['😊', '👍', '❤️', '🙏'];
    }
  });

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    
    // Atualizar emojis recentes
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 12);
    setRecentEmojis(newRecent);
    
    try {
      localStorage.setItem('recentEmojis', JSON.stringify(newRecent));
    } catch (error) {
      console.warn('Não foi possível salvar emojis recentes:', error);
    }
  };

  // Filtrar emojis baseado na busca
  const getFilteredEmojis = () => {
    const categoryEmojis = activeCategory === 'frequentes' 
      ? recentEmojis 
      : EMOJI_CATEGORIES[activeCategory].emojis;

    if (!searchTerm) return categoryEmojis;

    // Busca simples - poderia ser expandida com nomes de emojis
    return categoryEmojis.filter(emoji => 
      emoji.includes(searchTerm)
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          type="button"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={5}
      >
        <div className="flex flex-col h-96">
          {/* Campo de busca */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Buscar emoji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Categorias */}
          <div className="flex gap-1 p-2 border-b overflow-x-auto">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key as keyof typeof EMOJI_CATEGORIES);
                  setSearchTerm('');
                }}
                className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                  activeCategory === key 
                    ? 'bg-orange-500 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Grid de Emojis */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-8 gap-1">
              {getFilteredEmojis().map((emoji, index) => (
                <button
                  key={`${activeCategory}-${index}-${emoji}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 hover:bg-gray-100 rounded text-xl transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {getFilteredEmojis().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Nenhum emoji encontrado</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

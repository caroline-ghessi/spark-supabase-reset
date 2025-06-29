
// Mapeamento de atalhos de texto para emojis
export const emojiShortcuts: Record<string, string> = {
  ':)': '😊',
  ':-)': '😊',
  ':D': '😃',
  ':(': '😢',
  ':-(': '😢',
  ';)': '😉',
  ':P': '😛',
  ':p': '😛',
  ':o': '😮',
  ':O': '😮',
  ':|': '😐',
  ':/': '😕',
  ':*': '😘',
  '<3': '❤️',
  '</3': '💔',
  ':ok:': '👌',
  ':+1:': '👍',
  ':-1:': '👎',
  ':clap:': '👏',
  ':fire:': '🔥',
  ':100:': '💯',
  ':rocket:': '🚀',
  ':star:': '⭐',
  ':check:': '✅',
  ':x:': '❌'
};

// Função para substituir atalhos por emojis
export function replaceShortcutsWithEmojis(text: string): string {
  let result = text;
  
  Object.entries(emojiShortcuts).forEach(([shortcut, emoji]) => {
    // Usar regex para substituir apenas quando há espaços ou início/fim de string
    const regex = new RegExp(`(^|\\s)${escapeRegex(shortcut)}($|\\s)`, 'g');
    result = result.replace(regex, `$1${emoji}$2`);
  });
  
  return result;
}

// Função para escapar caracteres especiais em regex
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Função para detectar se uma string termina com um atalho
export function endsWithShortcut(text: string): string | null {
  const words = text.split(/\s+/);
  const lastWord = words[words.length - 1];
  
  for (const shortcut of Object.keys(emojiShortcuts)) {
    if (lastWord === shortcut) {
      return shortcut;
    }
  }
  
  return null;
}

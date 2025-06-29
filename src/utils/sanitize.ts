
// Utilitários de sanitização aprimorados para prevenir XSS e outras vulnerabilidades
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Remove tags HTML perigosas de forma mais abrangente
  const dangerousTags = /<script[^>]*>.*?<\/script>|<iframe[^>]*>.*?<\/iframe>|<object[^>]*>.*?<\/object>|<embed[^>]*>.*?<\/embed>|<link[^>]*>|<meta[^>]*>|<style[^>]*>.*?<\/style>/gi;
  let clean = html.replace(dangerousTags, '');
  
  // Remove atributos perigosos de forma mais abrangente
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  clean = clean.replace(/data\s*:/gi, '');
  clean = clean.replace(/vbscript\s*:/gi, '');
  
  // Remove comentários HTML que podem conter código
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');
  
  return clean;
};

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove caracteres de controle e limita tamanho
  return input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove caracteres de controle e não imprimíveis
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres Unicode de controle
    .trim()
    .substring(0, 1000); // Limite de 1000 caracteres
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Remove caracteres perigosos para nomes de arquivo
    .replace(/^\.+/, '') // Remove pontos no início
    .replace(/\.+$/, '') // Remove pontos no final
    .substring(0, 255); // Limite padrão de sistemas de arquivo
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Validação mais rigorosa de número de telefone brasileiro
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verificar comprimento
  if (cleanPhone.length < 10 || cleanPhone.length > 16) return false;
  
  // Verificar se não são todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanPhone)) return false;
  
  // Verificar formato brasileiro básico
  const phoneRegex = /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3,4})\-?(\d{4}))$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Validação mais rigorosa de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Verificar comprimento
  if (email.length > 254) return false;
  
  // Verificar formato básico
  if (!emailRegex.test(email)) return false;
  
  // Verificar se não há caracteres perigosos
  if (/[<>'"&]/.test(email)) return false;
  
  return true;
};

export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // Apenas HTTPS é permitido para URLs externas
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
};

// Sanitização para prevenção de SQL Injection (mesmo usando prepared statements)
export const sanitizeForDatabase = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/['";\\]/g, '') // Remove caracteres SQL perigosos
    .replace(/--/g, '') // Remove comentários SQL
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários SQL de bloco
    .trim()
    .substring(0, 500); // Limite razoável para campos de database
};

// Validação de senha segura
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Senha é obrigatória');
    return { valid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('Senha muito longa (máximo 128 caracteres)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  // Verificar senhas comuns
  const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Senha muito comum, escolha uma mais segura');
  }
  
  return { valid: errors.length === 0, errors };
};

// Escape para HTML (prevenção XSS)
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Validação de JSON segura
export const safeJsonParse = (jsonString: string): any => {
  try {
    // Verificar se não contém funções ou código malicioso
    if (/function|eval|constructor|prototype|__proto__/.test(jsonString)) {
      throw new Error('JSON contém código potencialmente perigoso');
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Erro ao fazer parse do JSON:', error);
    return null;
  }
};

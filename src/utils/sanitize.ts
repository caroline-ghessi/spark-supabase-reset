
// Utilitários de sanitização para prevenir XSS
export const sanitizeHtml = (html: string): string => {
  // Remove tags HTML perigosas
  const dangerousTags = /<script[^>]*>.*?<\/script>|<iframe[^>]*>.*?<\/iframe>|<object[^>]*>.*?<\/object>|<embed[^>]*>.*?<\/embed>/gi;
  let clean = html.replace(dangerousTags, '');
  
  // Remove atributos perigosos
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  
  return clean;
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove caracteres de controle e limita tamanho
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove caracteres de controle
    .trim()
    .substring(0, 1000); // Limite de 1000 caracteres
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Validação básica de número de telefone brasileiro
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/\D/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10 && cleanPhone.length <= 16;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
};


-- Alterar a constraint para incluir 'received' como status válido
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_status_check;

ALTER TABLE messages ADD CONSTRAINT messages_status_check 
CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'received'));

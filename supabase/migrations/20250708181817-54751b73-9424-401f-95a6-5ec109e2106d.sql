
-- Correção dos números WhatsApp dos vendedores conforme lista fornecida

-- Atualizar Antônio Nogueira (assumindo que o nome pode variar)
UPDATE sellers 
SET whatsapp_number = '5194916259'
WHERE name ILIKE '%antonio%' AND name ILIKE '%nogueira%';

-- Atualizar Antonio Cesar  
UPDATE sellers 
SET whatsapp_number = '5551975196107'
WHERE name ILIKE '%antonio%' AND name ILIKE '%cesar%';

-- Atualizar Cristiano
UPDATE sellers 
SET whatsapp_number = '5551952652183'
WHERE name ILIKE '%cristiano%';

-- Atualizar Douglas
UPDATE sellers 
SET whatsapp_number = '5551964943141'
WHERE name ILIKE '%douglas%';

-- Atualizar Felipe
UPDATE sellers 
SET whatsapp_number = '5551981252666'
WHERE name ILIKE '%felipe%';

-- Atualizar Gabriel
UPDATE sellers 
SET whatsapp_number = '555181690036'
WHERE name ILIKE '%gabriel%';

-- Atualizar Luan
UPDATE sellers 
SET whatsapp_number = '5551981423303'
WHERE name ILIKE '%luan%';

-- Atualizar Marcia
UPDATE sellers 
SET whatsapp_number = '5551981181894'
WHERE name ILIKE '%marcia%';

-- Atualizar Ronaldo
UPDATE sellers 
SET whatsapp_number = '5551930874184'
WHERE name ILIKE '%ronaldo%';

-- Atualizar Sergio (manter o número atual se já estiver correto)
UPDATE sellers 
SET whatsapp_number = '5551814233105'
WHERE name ILIKE '%sergio%';

-- Adicionar comentário para documentar a atualização
COMMENT ON COLUMN sellers.whatsapp_number IS 'Números WhatsApp atualizados em 2025-01-07. Vendedores com token Whapi: Antonio Nogueira, Douglas, Felipe, Gabriel, Luan, Marcia, Sergio.';

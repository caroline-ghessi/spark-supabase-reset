-- First drop the view that depends on whapi_status
DROP VIEW IF EXISTS vendor_conversations_full;

-- Remove whapi_token fields from sellers table for security
-- All communications will be centralized via Rodri.GO
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_token;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_webhook_url;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_instance_id;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_status;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_last_sync;

-- Recreate the view without whapi_status column
CREATE VIEW vendor_conversations_full AS
SELECT 
    c.id as conversation_id,
    c.assigned_seller_id as seller_id,
    c.client_name,
    c.client_phone,
    c.lead_temperature,
    c.status as conversation_status,
    c.created_at,
    c.updated_at,
    s.name as seller_name,
    COUNT(vm.id) as total_messages,
    COUNT(CASE WHEN vm.is_from_seller THEN 1 END) as seller_messages,
    COUNT(CASE WHEN NOT vm.is_from_seller THEN 1 END) as client_messages,
    MIN(vm.sent_at) as first_message_at,
    MAX(vm.sent_at) as last_message_at,
    AVG(vm.quality_score) as avg_quality_score,
    COUNT(CASE WHEN vm.flagged_for_review THEN 1 END) as flagged_count,
    (
        SELECT vm2.text_content 
        FROM vendor_whatsapp_messages vm2 
        WHERE vm2.conversation_id = c.id 
        ORDER BY vm2.sent_at DESC 
        LIMIT 1
    ) as last_message_text
FROM conversations c
LEFT JOIN sellers s ON s.id = c.assigned_seller_id
LEFT JOIN vendor_whatsapp_messages vm ON vm.conversation_id = c.id
WHERE c.assigned_seller_id IS NOT NULL
GROUP BY c.id, c.assigned_seller_id, c.client_name, c.client_phone, 
         c.lead_temperature, c.status, c.created_at, c.updated_at, s.name;

-- Add comment to document the security change
COMMENT ON TABLE sellers IS 'Seller information. Whapi tokens moved to secrets for security. All communications centralized via Rodri.GO.';
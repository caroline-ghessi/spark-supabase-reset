-- Remove whapi_token fields from sellers table for security
-- All communications will be centralized via Rodri.GO
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_token;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_webhook_url;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_instance_id;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_status;
ALTER TABLE sellers DROP COLUMN IF EXISTS whapi_last_sync;

-- Add comment to document the security change
COMMENT ON TABLE sellers IS 'Seller information. Whapi tokens moved to secrets for security. All communications centralized via Rodri.GO.';
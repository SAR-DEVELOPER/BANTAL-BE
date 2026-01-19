-- Fix existing asset URLs to store only object paths
-- Run this SQL to migrate existing assets from full URLs to object paths

-- Update photo_url: Extract path after 'bantal-assets/'
UPDATE asset 
SET photo_url = REGEXP_REPLACE(photo_url, '^.*bantal-assets/', '', 'g')
WHERE photo_url IS NOT NULL 
  AND photo_url LIKE '%bantal-assets/%';

-- Update invoice_file: Extract path after 'bantal-assets/'
UPDATE asset 
SET invoice_file = REGEXP_REPLACE(invoice_file, '^.*bantal-assets/', '', 'g')
WHERE invoice_file IS NOT NULL 
  AND invoice_file LIKE '%bantal-assets/%';

-- Update tax_invoice_file: Extract path after 'bantal-assets/'
UPDATE asset 
SET tax_invoice_file = REGEXP_REPLACE(tax_invoice_file, '^.*bantal-assets/', '', 'g')
WHERE tax_invoice_file IS NOT NULL 
  AND tax_invoice_file LIKE '%bantal-assets/%';

-- Verify the changes
SELECT 
    id,
    asset_code,
    photo_url,
    invoice_file,
    tax_invoice_file
FROM asset
WHERE photo_url IS NOT NULL OR invoice_file IS NOT NULL OR tax_invoice_file IS NOT NULL
LIMIT 10;

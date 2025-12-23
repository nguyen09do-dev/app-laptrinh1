-- Fix Facebook Page ID and Token
UPDATE integration_credentials 
SET config = jsonb_build_object(
    'appId', config->>'appId',
    'appSecret', config->>'appSecret',
    'pageId', '838349179372119',
    'pageAccessToken', 'EAARvzXnhVYYBQHXHZAc7ZAXkHOcJ9535BlxGEfI58Sdy2xTc5MJ0xZBaadabYyrieIbYRquS22MzyZAlFfxJWI3Asv1pEvGBoZBRRaKP23ZCt0M77XZBN9waCXLbok6J4QmTWlwbLu4bXiSdmmBaxbnRUoOndasZC1FuBxXoyVwdJG9gg7EwgNAurb2dEGdLcH9DE6b2w6u6qeJj1fOrRSMNijrdZCAr9mnk6roAx1ipMyLsV',
    'apiVersion', 'v18.0',
    'updatedAt', NOW()::text
)
WHERE platform = 'facebook';





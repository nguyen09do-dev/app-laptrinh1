# Integrations API - Quick Reference

## 🚀 Quick Start

### 1. Run Migration
```bash
npx tsx migrations/run-integrations-migration.ts
```

### 2. API Endpoints

#### Mailchimp
```bash
# Save credentials
POST /api/integrations/mailchimp/save
{
  "apiKey": "abc-us1",
  "serverPrefix": "us1",
  "audienceListId": "123"
}

# Test connection
POST /api/integrations/mailchimp/test

# Publish
POST /api/integrations/mailchimp/publish
{
  "pack_id": "uuid"
}
```

#### WordPress
```bash
# Save credentials
POST /api/integrations/wordpress/save
{
  "siteUrl": "https://site.com",
  "username": "admin",
  "applicationPassword": "xxxx xxxx"
}

# Test connection
POST /api/integrations/wordpress/test

# Publish
POST /api/integrations/wordpress/publish
{
  "pack_id": "uuid"
}
```

## 📁 Files Created

```
backend/
├── migrations/
│   ├── 009_add_integration_credentials.sql
│   └── run-integrations-migration.ts
├── src/
│   ├── controllers/
│   │   └── integrations.controller.ts
│   ├── routes/
│   │   └── integrations.routes.ts
│   └── services/
│       ├── mailchimp.service.ts
│       └── wordpress.service.ts
```

## 🔑 Credentials Format

**Mailchimp:**
- API Key: From Mailchimp Dashboard → Account → API Keys
- Server Prefix: e.g., "us1" (in your API key)
- List ID: Audience → Settings → Audience ID

**WordPress:**
- Site URL: https://yoursite.com
- Username: WordPress username
- App Password: Users → Profile → Application Passwords

## ⚡ Features

✅ Validate, test, save credentials
✅ Publish to Mailchimp (email campaigns)
✅ Publish to WordPress (blog posts as drafts)
✅ Retry logic (2 attempts for network errors)
✅ Unified error handling
✅ No retry on auth errors

## 🛠️ Error Responses

```json
{
  "success": false,
  "platform": "mailchimp",
  "error": {
    "message": "Error message",
    "details": "Additional details"
  }
}
```

## 📝 Publishing Flow

1. Create content pack with derivatives
2. Save integration credentials
3. Test connection
4. Publish to platform

**Requirements:**
- Content pack must have `derivatives.email` (Mailchimp)
- Content pack must have `derivatives.blog_summary` + `derivatives.seo_description` (WordPress)

---

For detailed documentation, see [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)

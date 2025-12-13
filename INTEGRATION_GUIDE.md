# 🚀 Integration Guide - Mailchimp & WordPress Publishing

Complete backend integration system for publishing content from ContentHub to Mailchimp and WordPress.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Mailchimp Integration](#mailchimp-integration)
- [WordPress Integration](#wordpress-integration)
- [Error Handling](#error-handling)
- [Testing](#testing)

---

## 🎯 Overview

This integration system allows you to publish content derivatives from ContentHub to:
1. **Mailchimp** - Send email newsletters via campaigns
2. **WordPress** - Create blog posts via REST API

### Architecture

```
Content Pack (derivatives) → API Endpoints → Service Layer → Third-party APIs
                                ↓
                        Credentials Storage (PostgreSQL)
```

---

## 💾 Database Setup

### Migration

The integration credentials are stored in a new table `integration_credentials`:

```sql
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,  -- 'mailchimp' | 'wordpress'
    config JSONB NOT NULL,          -- API keys, URLs, etc.
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(platform)
);
```

**Run Migration:**
```bash
cd backend
npx tsx migrations/run-integrations-migration.ts
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:3001/api`

### Mailchimp Endpoints

#### 1. Save Credentials
```http
POST /integrations/mailchimp/save
Content-Type: application/json

{
  "apiKey": "your-mailchimp-api-key",
  "serverPrefix": "us1",
  "audienceListId": "your-list-id"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "mailchimp",
  "message": "Credentials saved successfully"
}
```

#### 2. Test Connection
```http
POST /integrations/mailchimp/test
```

**Response:**
```json
{
  "success": true,
  "platform": "mailchimp",
  "message": "Connection successful"
}
```

#### 3. Publish Campaign
```http
POST /integrations/mailchimp/publish
Content-Type: application/json

{
  "pack_id": "uuid-of-content-pack"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "mailchimp",
  "campaignId": "campaign-id-from-mailchimp",
  "sent": true
}
```

---

### WordPress Endpoints

#### 1. Save Credentials
```http
POST /integrations/wordpress/save
Content-Type: application/json

{
  "siteUrl": "https://your-wordpress-site.com",
  "username": "your-username",
  "applicationPassword": "xxxx xxxx xxxx xxxx"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "wordpress",
  "message": "Credentials saved successfully"
}
```

#### 2. Test Connection
```http
POST /integrations/wordpress/test
```

**Response:**
```json
{
  "success": true,
  "platform": "wordpress",
  "message": "Connection successful"
}
```

#### 3. Publish Post
```http
POST /integrations/wordpress/publish
Content-Type: application/json

{
  "pack_id": "uuid-of-content-pack"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "wordpress",
  "postId": 123,
  "url": "https://your-site.com/2025/12/your-post"
}
```

---

## 📧 Mailchimp Integration

### Prerequisites

1. **Mailchimp Account** with API access
2. **API Key**: Get from Mailchimp Dashboard → Account → Extras → API Keys
3. **Server Prefix**: Found in your API key (e.g., `us1`, `us2`, `us19`)
4. **Audience List ID**: Get from Mailchimp → Audience → Settings → Audience ID

### How It Works

1. **Create Campaign**: Creates a regular email campaign
2. **Set Content**: Sets HTML content from `derivatives.email`
3. **Send Campaign**: Sends the campaign to your audience

### Configuration Example

```json
{
  "apiKey": "abc123def456-us1",
  "serverPrefix": "us1",
  "audienceListId": "1a2b3c4d5e"
}
```

### Retry Logic

- **Network errors**: Retries 2 times with exponential backoff
- **Auth errors (401, 403)**: No retry, returns error immediately
- **Other errors**: Retries 2 times

---

## 📝 WordPress Integration

### Prerequisites

1. **WordPress Site** with REST API enabled (WP 4.7+)
2. **Application Password**:
   - Go to WordPress Admin → Users → Your Profile
   - Scroll to "Application Passwords"
   - Create new application password
3. **User Permissions**: User must have `edit_posts` capability

### How It Works

1. **Extract Title**: From first line of `draft_content`
2. **Set Content**: Uses `derivatives.blog_summary`
3. **Set Excerpt**: Uses `derivatives.seo_description`
4. **Create Post**: Creates as **draft** (for safety)

### Configuration Example

```json
{
  "siteUrl": "https://example.com",
  "username": "admin",
  "applicationPassword": "abcd efgh ijkl mnop"
}
```

### Authentication

Uses **Basic Auth** with username and application password:
```
Authorization: Basic base64(username:applicationPassword)
```

### Retry Logic

- **Network errors**: Retries 2 times
- **Auth errors (401, 403)**: No retry
- **Permission errors**: Returns clear error message

---

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "platform": "mailchimp" | "wordpress",
  "error": {
    "message": "Human-readable error message",
    "details": "Additional error details"
  }
}
```

### Common Errors

#### Missing Credentials (400)
```json
{
  "success": false,
  "platform": "mailchimp",
  "error": {
    "message": "Missing credentials",
    "details": "Please save Mailchimp credentials first"
  }
}
```

#### No Derivatives (400)
```json
{
  "success": false,
  "platform": "mailchimp",
  "error": {
    "message": "No derivatives available",
    "details": "Please generate derivatives first"
  }
}
```

#### Connection Failed (400)
```json
{
  "success": false,
  "platform": "wordpress",
  "error": {
    "message": "Connection failed",
    "details": "Authentication failed. Please check your credentials."
  }
}
```

#### Pack Not Found (404)
```json
{
  "success": false,
  "platform": "mailchimp",
  "error": {
    "message": "Content pack not found"
  }
}
```

---

## 🧪 Testing

### Manual Testing Flow

1. **Generate Content Pack**
   ```bash
   POST /api/packs/from-brief/:briefId
   ```

2. **Generate Derivatives**
   ```bash
   POST /api/packs/derivatives
   {
     "pack_id": "your-pack-id"
   }
   ```

3. **Save Integration Credentials**
   ```bash
   POST /api/integrations/mailchimp/save
   {
     "apiKey": "...",
     "serverPrefix": "us1",
     "audienceListId": "..."
   }
   ```

4. **Test Connection**
   ```bash
   POST /api/integrations/mailchimp/test
   ```

5. **Publish**
   ```bash
   POST /api/integrations/mailchimp/publish
   {
     "pack_id": "your-pack-id"
   }
   ```

### Using curl

**Save Mailchimp Credentials:**
```bash
curl -X POST http://localhost:3001/api/integrations/mailchimp/save \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-api-key",
    "serverPrefix": "us1",
    "audienceListId": "your-list-id"
  }'
```

**Test Connection:**
```bash
curl -X POST http://localhost:3001/api/integrations/mailchimp/test
```

**Publish to Mailchimp:**
```bash
curl -X POST http://localhost:3001/api/integrations/mailchimp/publish \
  -H "Content-Type: application/json" \
  -d '{
    "pack_id": "ef127879-7b1e-4dfb-a3f9-e2686061209b"
  }'
```

---

## 📁 File Structure

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

---

## 🔐 Security Notes

1. **Credentials Storage**: API keys are stored in PostgreSQL. Consider encryption for production.
2. **HTTPS**: Always use HTTPS in production for API calls.
3. **Application Passwords**: WordPress application passwords are more secure than regular passwords.
4. **Validation**: All inputs are validated before use.
5. **Error Messages**: Sensitive information is not exposed in error messages.

---

## 🎉 Features

✅ **Mailchimp Integration**
- Validate, test, and save credentials
- Create and send email campaigns
- Retry logic with exponential backoff
- Detailed error handling

✅ **WordPress Integration**
- Validate, test, and save credentials
- Create blog posts as drafts
- Basic Auth with application passwords
- Markdown to HTML conversion

✅ **Database**
- Credentials stored in PostgreSQL
- One credential per platform
- Auto-update timestamps

✅ **Error Handling**
- Unified error response format
- Retry logic for network errors
- Clear error messages
- No retry on auth errors

---

## 📞 Support

For issues or questions:
1. Check error logs in backend console
2. Verify credentials are correct
3. Test connection before publishing
4. Check Mailchimp/WordPress API status

---

## 🚀 Next Steps

1. **Add More Platforms**: Twitter, LinkedIn, Facebook
2. **Scheduling**: Schedule posts for future dates
3. **Analytics**: Track publish success/failure
4. **Webhooks**: Listen for platform events
5. **Encryption**: Encrypt credentials at rest

---

**Built with ❤️ for ContentHub**

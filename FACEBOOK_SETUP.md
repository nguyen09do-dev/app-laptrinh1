# 📘 Facebook Integration Setup Guide

Hướng dẫn chi tiết cách lấy Facebook credentials để tích hợp với AI Content Studio.

---

## 📋 Tổng Quan

Để đăng bài lên Facebook Page, bạn cần:
1. **Facebook App** (App ID + App Secret)
2. **Facebook Page** (Page ID + Page Access Token)

---

## 🚀 BƯỚC 1: Tạo Facebook App

### 1.1. Truy cập Facebook Developers

Vào: **https://developers.facebook.com/apps**

### 1.2. Tạo App Mới

1. Click **"Create App"**
2. Chọn loại app:
   - **Business** (nếu dùng cho doanh nghiệp)
   - **Other** (nếu dùng cá nhân/test)
3. Click **"Next"**

### 1.3. Điền Thông Tin App

**Thông tin cần điền:**
- **App Name**: Tên app của bạn (VD: "My Content Publisher")
- **App Contact Email**: Email liên hệ
- **Business Account**: (Optional) Chọn nếu có

Click **"Create App"**

### 1.4. Lấy App ID và App Secret

Sau khi tạo app, vào **Settings → Basic**:

1. **App ID**: 
   - Copy số App ID (VD: `123456789012345`)
   
2. **App Secret**:
   - Click **"Show"** để hiện App Secret
   - Copy App Secret (VD: `abc123def456...`)
   - ⚠️ **Giữ bí mật**, không share công khai

### 1.5. Cấu Hình App (Quan Trọng!)

Vẫn ở **Settings → Basic**, điền các thông tin sau:

1. **Privacy Policy URL**: (Required)
   - VD: `https://yourwebsite.com/privacy`
   - Hoặc dùng generator: https://www.privacypolicygenerator.info/

2. **Terms of Service URL**: (Optional)
   - VD: `https://yourwebsite.com/terms`

3. **App Domains**: (Optional)
   - VD: `yourwebsite.com`

4. **Category**: 
   - Chọn **"Business and Pages"**

Click **"Save Changes"**

---

## 📄 BƯỚC 2: Lấy Page Access Token

### 2.1. Thêm Facebook Login vào App

1. Vào **Dashboard** của app
2. Tìm **"Facebook Login"** trong danh sách products
3. Click **"Set Up"**
4. Chọn **"Web"** platform
5. Nhập Site URL (VD: `http://localhost:3000`)
6. Click **"Save"**

### 2.2. Sử Dụng Graph API Explorer

Vào: **https://developers.facebook.com/tools/explorer/**

### 2.3. Chọn App và Permissions

1. **Chọn App**:
   - Ở góc trên bên phải, chọn app bạn vừa tạo

2. **Chọn Permissions** (⚠️ QUAN TRỌNG!):
   Click **"Add a Permission"** và chọn **ĐỦ CẢ 4 QUYỀN SAU**:
   - ✅ `pages_manage_posts` (Đăng bài) - **BẮT BUỘC**
   - ✅ `pages_read_engagement` (Đọc engagement) - **BẮT BUỘC**
   - ✅ `pages_show_list` (Xem danh sách pages)
   - ✅ `public_profile` (Thông tin cơ bản)
   
   ⚠️ **LƯU Ý**: Phải có **CẢ 2** permissions `pages_manage_posts` VÀ `pages_read_engagement` để đăng bài được!

3. Click **"Generate Access Token"**

### 2.4. Chuyển sang Page Access Token

1. Sau khi generate User Access Token, click vào **"Get Page Access Token"**
2. Chọn **Facebook Page** bạn muốn đăng bài
3. Copy **Page Access Token** (bắt đầu bằng `EAA...`)

### 2.5. Lấy Page ID

**Cách 1: Từ Graph API Explorer**
- Sau khi có Page Access Token, Page ID sẽ hiện ngay bên cạnh

**Cách 2: Từ Facebook Page**
1. Vào Facebook Page của bạn
2. Click **"About"** (Giới thiệu)
3. Scroll xuống, tìm **"Page ID"**

**Cách 3: Từ URL**
- URL page: `https://www.facebook.com/YourPageName`
- Vào: `https://www.facebook.com/YourPageName/about`
- Page ID sẽ hiện ở phần "More Info"

### 2.6. Tạo Long-Lived Token (Quan Trọng!)

Page Access Token mặc định chỉ tồn tại **1-2 giờ**. Để có token lâu dài:

**Sử dụng Graph API:**

```bash
https://graph.facebook.com/v18.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={APP_ID}&
  client_secret={APP_SECRET}&
  fb_exchange_token={SHORT_LIVED_TOKEN}
```

**Thay thế:**
- `{APP_ID}`: App ID của bạn
- `{APP_SECRET}`: App Secret của bạn
- `{SHORT_LIVED_TOKEN}`: Page Access Token vừa lấy

**Response:**
```json
{
  "access_token": "EAAxxxxxxxxxxxxx...",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

Copy `access_token` này để dùng (token này tồn tại ~60 ngày).

---

## ⚙️ BƯỚC 3: Lưu Credentials vào App

### 3.1. Vào Settings Page

1. Mở AI Content Studio: `http://localhost:3000`
2. Vào **Settings** (⚙️)
3. Click tab **"🔗 Integrations"**

### 3.2. Điền Facebook Configuration

Điền các thông tin đã lấy được:

1. **App ID**: 
   ```
   123456789012345
   ```

2. **App Secret**:
   ```
   abc123def456ghi789jkl012mno345pqr678
   ```

3. **Page ID**:
   ```
   987654321098765
   ```

4. **Page Access Token**:
   ```
   EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3.3. Test Connection

1. Click **"Test Connection"**
2. Nếu thành công, sẽ thấy:
   ```
   ✅ Kết nối thành công! Page: Your Page Name
   ```

3. Click **"Lưu cấu hình"**

---

## ✅ Checklist

Trước khi bắt đầu, đảm bảo bạn đã có:

- [ ] Facebook Account
- [ ] Facebook Page (đã tạo và có quyền admin)
- [ ] Facebook App (đã tạo và cấu hình)
- [ ] App ID
- [ ] App Secret
- [ ] Page ID
- [ ] Long-lived Page Access Token
- [ ] Privacy Policy URL (đã điền vào app settings)

---

## 🔒 Bảo Mật

### ⚠️ LƯU Ý QUAN TRỌNG:

1. **KHÔNG share App Secret** công khai
2. **KHÔNG commit** credentials vào Git
3. **KHÔNG log** token ra console trong production
4. **SỬ DỤNG** environment variables hoặc encrypted storage
5. **REFRESH** token định kỳ (mỗi 60 ngày)

### 📝 Best Practices:

```javascript
// ❌ BAD - Hardcoded credentials
const appSecret = "abc123def456...";

// ✅ GOOD - Environment variables
const appSecret = process.env.FACEBOOK_APP_SECRET;
```

---

## 🐛 Troubleshooting

### Lỗi: "Invalid OAuth access token"

**Nguyên nhân**: Token hết hạn hoặc không hợp lệ

**Giải pháp**:
1. Generate token mới từ Graph API Explorer
2. Tạo long-lived token
3. Lưu lại vào Settings

---

### Lỗi: "This endpoint requires the 'pages_manage_posts' permission"

**Nguyên nhân**: Thiếu permission

**Giải pháp**:
1. Vào Graph API Explorer
2. Add permission `pages_manage_posts`
3. Generate token lại

---

### Lỗi: "(#200) requires both pages_read_engagement and pages_manage_posts"

**Nguyên nhân**: Thiếu permission `pages_read_engagement`

**Giải pháp**:
1. Vào Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Chọn app của bạn
3. Click **"Add a Permission"**, tìm và chọn:
   - `pages_read_engagement` ✅
   - `pages_manage_posts` ✅ (nếu chưa có)
4. Click **"Generate Access Token"**
5. Chọn **"Get Page Access Token"**
6. Chọn page của bạn
7. Copy **Page Access Token** mới
8. Vào Publisher → Integrations → Facebook → **Edit**
9. Paste token mới vào **"Page Access Token"**
10. Click **"Save Configuration"**
11. Click **"Test"** để kiểm tra

⚠️ **QUAN TRỌNG**: Facebook yêu cầu **CẢ HAI** permissions để đăng bài lên Page!

---

### Lỗi: "Unsupported get request"

**Nguyên nhân**: Page ID sai hoặc token không có quyền

**Giải pháp**:
1. Kiểm tra lại Page ID
2. Đảm bảo token được generate cho đúng page
3. Kiểm tra permissions

---

### Lỗi: "App not set up for Facebook Login"

**Nguyên nhân**: Chưa setup Facebook Login product

**Giải pháp**:
1. Vào App Dashboard
2. Add "Facebook Login" product
3. Configure settings

---

## 📚 Tài Liệu Tham Khảo

- **Facebook Developers**: https://developers.facebook.com/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Pages API Documentation**: https://developers.facebook.com/docs/pages-api
- **Access Token Debugger**: https://developers.facebook.com/tools/debug/accesstoken/

---

## 🎯 Tiếp Theo

Sau khi cấu hình xong, bạn có thể:

1. **Đăng bài thử nghiệm**: Vào Publisher → Chọn content → Chọn Facebook → Publish
2. **Xem lịch sử**: Vào Publisher → History tab
3. **Quản lý posts**: Vào Facebook Page để xem bài đã đăng

---

## 💡 Tips

### Lấy Token Không Hết Hạn (Never-Expire Token)

⚠️ **Lưu ý**: Facebook không cho phép token không hết hạn. Token tối đa tồn tại ~60 ngày.

**Workaround**:
- Tạo script tự động refresh token mỗi 30 ngày
- Hoặc sử dụng System User Token (cho Business Manager)

### Test Token

Kiểm tra token còn hạn không:

```bash
https://graph.facebook.com/debug_token?
  input_token={TOKEN_TO_CHECK}&
  access_token={APP_TOKEN}
```

---

**Chúc bạn setup thành công!** 🎉

Nếu gặp vấn đề, hãy check lại từng bước hoặc liên hệ support.


# 📚 Hướng dẫn sử dụng RAG để tạo Content/Ideas theo Style

## 🎯 Tổng quan

Hệ thống RAG (Retrieval Augmented Generation) cho phép bạn tạo content và ideas theo style từ các tài liệu đã upload vào knowledge base. Hệ thống sẽ:
1. Tìm kiếm các tài liệu liên quan trong knowledge base
2. Phân tích style và tone của các tài liệu đó
3. Tạo content mới theo style tương tự

## 📋 Quy trình sử dụng

### Bước 1: Upload tài liệu mẫu (Style Reference)

1. Vào trang **Documents** (`/documents`)
2. Click **"Upload Document"**
3. Upload các tài liệu có style mà bạn muốn:
   - **Professional style**: Báo cáo, whitepaper, nghiên cứu
   - **Casual style**: Blog posts, social media content
   - **Academic style**: Bài nghiên cứu, luận văn
4. Điền metadata:
   - **Title**: Tên tài liệu
   - **Author**: Tác giả (có thể dùng để filter sau)
   - **Tags**: Thêm tags như "professional", "casual", "academic", "marketing", etc.
   - **Published Date**: Ngày xuất bản
   - **URL**: Link nguồn (nếu có)

### Bước 2: Tạo Ideas với RAG

1. Vào trang **Ideas** (`/ideas`)
2. Nhập **Persona** và **Industry**
3. Click **"Generate Ideas"**
4. Hệ thống sẽ tự động tìm kiếm trong knowledge base và tạo ideas phù hợp

> **Lưu ý**: Hiện tại Ideas generation chưa có UI để chọn style cụ thể, nhưng hệ thống sẽ tự động tìm tài liệu liên quan dựa trên Persona và Industry.

### Bước 3: Tạo Brief từ Idea (với RAG)

1. Duyệt một Idea (click vào idea → **"Duyệt"**)
2. Click **"Tạo Brief"**
3. Hệ thống sẽ:
   - Tìm kiếm tài liệu liên quan trong knowledge base
   - Tạo brief với thông tin từ các tài liệu đó
   - Bao gồm citations [1], [2], [3]...

### Bước 4: Tạo Content từ Brief (với Style)

1. Vào trang **Content** (`/content`)
2. Chọn một Brief chưa có content
3. Click **"Tạo Content"**
4. Hệ thống sẽ tạo content với:
   - **Style mặc định**: Professional
   - **RAG context**: Từ các tài liệu liên quan
   - **Citations**: Tự động thêm citations [1], [2]...

## 🎨 Các Style có sẵn

### 1. Professional (Chuyên nghiệp)
- **Đặc điểm**: Formal, khách quan, dùng thuật ngữ chuyên ngành
- **Phù hợp**: Báo cáo, whitepaper, business content
- **Cách dùng**: Style mặc định khi tạo content

### 2. Casual (Thân mật)
- **Đặc điểm**: Friendly, conversational, dễ hiểu
- **Phù hợp**: Blog posts, social media, content marketing
- **Cách dùng**: Cần cập nhật API để chọn style

### 3. Academic (Học thuật)
- **Đặc điểm**: Scholarly, research-oriented, phân tích sâu
- **Phù hợp**: Nghiên cứu, luận văn, academic papers
- **Cách dùng**: Cần cập nhật API để chọn style

## 🔍 Cách RAG hoạt động

### Semantic Search
Hệ thống sử dụng **semantic search** để tìm tài liệu liên quan:
- Không cần từ khóa chính xác
- Hiểu ngữ nghĩa và ngữ cảnh
- Ví dụ: Tìm "AI trong marketing" sẽ tìm được tài liệu về "trí tuệ nhân tạo giúp quảng cáo"

### Style Learning
Khi tạo content, hệ thống sẽ:
1. Tìm các tài liệu liên quan (semantic search)
2. Phân tích style, tone, và cấu trúc của các tài liệu đó
3. Tạo content mới theo style tương tự
4. Thêm citations từ các nguồn đã sử dụng

## 💡 Tips & Best Practices

### 1. Upload đa dạng tài liệu
- Upload nhiều tài liệu với style khác nhau
- Tag rõ ràng để dễ filter
- Đảm bảo chất lượng tài liệu tốt

### 2. Sử dụng Tags hiệu quả
- Tag theo style: "professional", "casual", "academic"
- Tag theo chủ đề: "marketing", "technology", "healthcare"
- Tag theo format: "blog", "whitepaper", "social-media"

### 3. Test với nhiều queries
- Thử các cách diễn đạt khác nhau
- Kiểm tra kết quả search tại `/test-rag`
- Điều chỉnh match_threshold nếu cần

### 4. Kiểm tra Citations
- Content được tạo sẽ có citations [1], [2], [3]...
- Click vào citation để xem nguồn
- Đảm bảo citations chính xác

## 🛠️ Advanced: Tùy chỉnh RAG Parameters

### Khi tạo Brief:
```javascript
// API: POST /api/briefs/from-idea/:ideaId
// Có thể thêm query params:
?match_threshold=0.7  // Độ tương đồng tối thiểu (0-1)
?match_count=5        // Số lượng tài liệu tối đa
?author=John          // Filter theo author
?tags=marketing,AI    // Filter theo tags
```

### Khi tạo Content:
```javascript
// API: POST /api/contents/from-brief/:briefId
// Có thể thêm trong body:
{
  "style": "professional",  // hoặc "casual", "academic"
  "wordCount": 1000,
  "useRAG": true,
  "searchFilters": {
    "author": "John",
    "tags": ["marketing", "AI"],
    "match_threshold": 0.7,
    "match_count": 8
  }
}
```

## 📊 Test RAG Search

1. Vào `/test-rag`
2. Nhập query để tìm tài liệu
3. Chọn search type:
   - **Chunks**: Tìm theo đoạn văn (chi tiết hơn)
   - **Documents**: Tìm theo toàn bộ tài liệu
   - **Hybrid**: Kết hợp cả hai
4. Xem kết quả với similarity score

## 🎯 Ví dụ thực tế

### Ví dụ 1: Tạo content marketing theo style casual
1. Upload các blog posts về marketing với style casual
2. Tag: "marketing", "casual", "blog"
3. Tạo idea về "Content Marketing cho Startup"
4. Tạo brief → Hệ thống sẽ tìm các blog posts đã upload
5. Tạo content → Content sẽ có style casual giống các blog posts

### Ví dụ 2: Tạo whitepaper theo style professional
1. Upload các whitepapers, research papers
2. Tag: "professional", "research", "whitepaper"
3. Tạo idea về "AI trong Healthcare"
4. Tạo brief → Hệ thống sẽ tìm các research papers
5. Tạo content → Content sẽ có style professional với citations

## ⚠️ Lưu ý quan trọng

1. **Chất lượng tài liệu**: Upload tài liệu chất lượng cao để có kết quả tốt
2. **Số lượng tài liệu**: Càng nhiều tài liệu, càng dễ tìm được nội dung liên quan
3. **Metadata**: Điền đầy đủ metadata (author, tags) để filter tốt hơn
4. **Citations**: Luôn kiểm tra citations để đảm bảo tính chính xác

## 🚀 Cải tiến sắp tới

- [ ] UI để chọn style khi tạo content
- [ ] UI để chọn documents làm style reference
- [ ] Preview style trước khi tạo
- [ ] Style mixing (kết hợp nhiều style)
- [ ] Custom style training từ documents

---

**Cần hỗ trợ?** Kiểm tra:
- `/test-rag` để test semantic search
- `/documents` để quản lý knowledge base
- Backend logs để xem quá trình RAG



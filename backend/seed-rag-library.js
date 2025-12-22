/**
 * Seed RAG Library với nội dung mẫu từ scholar & web
 * Tạo knowledge base chuẩn cho AI Content Studio
 */

const sampleDocuments = [
  {
    title: "AI trong Marketing Digital: Xu hướng và Chiến lược 2024",
    author: "Harvard Business Review",
    url: "https://hbr.org/ai-marketing-strategy",
    published_date: "2024-01-15",
    tags: ["AI", "Marketing", "Digital", "Strategy"],
    content: `# AI trong Marketing Digital: Xu hướng và Chiến lược 2024

## Tổng quan
Trí tuệ nhân tạo đang định hình lại cách các doanh nghiệp tiếp cận marketing digital. Từ cá nhân hóa nội dung đến tối ưu hóa chiến dịch, AI mang đến những cơ hội chưa từng có để nâng cao hiệu quả marketing.

## 1. Cá nhân hóa Nội dung với AI

### 1.1 Recommendation Engine
- Phân tích hành vi người dùng real-time
- Đề xuất sản phẩm/nội dung phù hợp
- Tăng tỷ lệ chuyển đổi lên 30-40%

### 1.2 Dynamic Content
- Tự động điều chỉnh nội dung theo đối tượng
- A/B testing tự động với AI
- Optimization liên tục dựa trên data

## 2. Chatbot và Conversational AI

### 2.1 Customer Service Automation
- Xử lý 70% câu hỏi thường gặp tự động
- Giảm 50% chi phí hỗ trợ khách hàng
- Cải thiện thời gian phản hồi xuống dưới 1 phút

### 2.2 Lead Generation
- Chatbot thu thập thông tin khách hàng
- Qualify leads tự động
- Nurture leads 24/7

## 3. Predictive Analytics

### 3.1 Customer Behavior Prediction
- Dự đoán khách hàng có khả năng mua
- Xác định churn risk
- Tối ưu timing cho campaigns

### 3.2 Budget Optimization
- Phân bổ ngân sách tự động
- ROI prediction cho từng channel
- Real-time bidding optimization

## Kết luận
AI không còn là tùy chọn mà là yếu tố bắt buộc trong marketing digital hiện đại. Các doanh nghiệp cần đầu tư vào AI từ sớm để duy trì lợi thế cạnh tranh.

## Nguồn tham khảo
- McKinsey Global Institute. (2023). The State of AI in Marketing.
- Gartner. (2024). Marketing Technology Trends.
- Salesforce. (2024). State of Marketing Report.`
  },
  {
    title: "Content Marketing: Chiến lược Tạo Nội dung Hiệu quả",
    author: "Content Marketing Institute",
    url: "https://contentmarketinginstitute.com/content-strategy",
    published_date: "2024-02-20",
    tags: ["Content Marketing", "Strategy", "SEO", "Engagement"],
    content: `# Content Marketing: Chiến lược Tạo Nội dung Hiệu quả

## Giới thiệu
Content marketing là nghệ thuật tạo và phân phối nội dung có giá trị để thu hút và giữ chân khách hàng. Bài viết này cung cấp framework hoàn chỉnh để xây dựng chiến lược content marketing hiệu quả.

## 1. Nghiên cứu và Hiểu Đối tượng

### 1.1 Buyer Persona Development
- Xác định đặc điểm nhân khẩu học
- Hiểu pain points và goals
- Map customer journey

### 1.2 Content Gap Analysis
- Phân tích nội dung đối thủ
- Xác định keywords opportunities
- Tìm content gaps trong ngành

## 2. Content Planning Framework

### 2.1 Content Pillars
- Xác định 3-5 chủ đề trụ cột
- Tạo topic clusters
- Link building strategy

### 2.2 Content Calendar
- Lập kế hoạch 3-6 tháng
- Phân bổ resources hiệu quả
- Track deadlines và milestones

## 3. Content Creation Best Practices

### 3.1 Storytelling Techniques
- Hook readers từ đầu
- Sử dụng data và case studies
- CTA rõ ràng và compelling

### 3.2 SEO Optimization
- Keyword research và placement
- On-page SEO checklist
- Technical SEO basics

## 4. Distribution Channels

### 4.1 Owned Media
- Blog và website
- Email newsletters
- Social media profiles

### 4.2 Earned Media
- PR và media mentions
- Guest posting
- Influencer collaborations

### 4.3 Paid Media
- Social media ads
- Native advertising
- Sponsored content

## 5. Measurement và Optimization

### 5.1 Key Metrics
- Traffic và engagement
- Conversion rates
- Revenue attribution

### 5.2 Continuous Improvement
- A/B testing content
- Repurposing top performers
- Updating evergreen content

## Kết luận
Content marketing thành công đòi hỏi chiến lược rõ ràng, execution nhất quán và measurement liên tục. Đầu tư vào content chất lượng sẽ mang lại ROI bền vững theo thời gian.`
  },
  {
    title: "SEO 2024: Thuật toán Google và Tối ưu hóa Tìm kiếm",
    author: "Search Engine Journal",
    url: "https://searchenginejournal.com/seo-guide-2024",
    published_date: "2024-03-10",
    tags: ["SEO", "Google", "Search", "Optimization"],
    content: `# SEO 2024: Thuật toán Google và Tối ưu hóa Tìm kiếm

## Overview
Google liên tục cập nhật thuật toán để cải thiện trải nghiệm tìm kiếm. Năm 2024, trọng tâm là E-E-A-T, Core Web Vitals và AI-powered search.

## 1. E-E-A-T: Experience, Expertise, Authoritativeness, Trust

### 1.1 Experience (Mới)
- Nội dung từ người có kinh nghiệm thực tế
- First-hand experience signals
- User-generated reviews và testimonials

### 1.2 Expertise
- Author credentials và bio
- Topical expertise demonstration
- In-depth content coverage

### 1.3 Authoritativeness
- Backlinks từ authoritative sources
- Brand mentions
- Industry recognition

### 1.4 Trustworthiness
- Secure website (HTTPS)
- Clear privacy policy
- Accurate information

## 2. Core Web Vitals

### 2.1 Largest Contentful Paint (LCP)
- Target: < 2.5 seconds
- Optimization: Image compression, lazy loading
- CDN implementation

### 2.2 First Input Delay (FID) / Interaction to Next Paint (INP)
- Target: < 100ms
- JavaScript optimization
- Reduce main thread work

### 2.3 Cumulative Layout Shift (CLS)
- Target: < 0.1
- Specify image dimensions
- Avoid dynamic content injection

## 3. AI và Search Generative Experience (SGE)

### 3.1 Understanding SGE
- AI-generated summaries
- Conversational search
- Multi-modal results

### 3.2 Optimizing for SGE
- Clear, factual content
- FAQ schema markup
- Comprehensive topic coverage

## 4. Technical SEO Essentials

### 4.1 Site Architecture
- Logical hierarchy
- Internal linking strategy
- Breadcrumb navigation

### 4.2 Mobile Optimization
- Mobile-first indexing
- Responsive design
- Page speed mobile

### 4.3 Schema Markup
- Article schema
- FAQ schema
- Product schema
- Local business schema

## 5. Content Strategy cho SEO

### 5.1 Topical Authority
- Cluster content model
- Pillar pages
- Supporting content

### 5.2 Search Intent Matching
- Informational queries
- Navigational queries
- Transactional queries

## Kết luận
SEO 2024 yêu cầu approach toàn diện: technical excellence, quality content và user experience tối ưu. Các updates của Google đều hướng tới việc reward content thực sự hữu ích cho users.`
  },
  {
    title: "Social Media Marketing: Strategies cho 2024",
    author: "Sprout Social",
    url: "https://sproutsocial.com/insights/social-media-strategy",
    published_date: "2024-02-05",
    tags: ["Social Media", "Marketing", "Facebook", "Instagram", "TikTok"],
    content: `# Social Media Marketing: Strategies cho 2024

## Landscape Overview
Social media tiếp tục evolve với sự nổi lên của short-form video, social commerce và AI-powered features. Brands cần adapt chiến lược để stay relevant.

## 1. Platform-Specific Strategies

### 1.1 TikTok
- Short-form video dominance
- Trends và challenges
- Creator collaborations
- TikTok Shop integration

### 1.2 Instagram
- Reels priority trong algorithm
- Stories engagement
- Shopping features
- Collaborative posts

### 1.3 LinkedIn
- B2B lead generation
- Thought leadership content
- Employee advocacy
- LinkedIn Live events

### 1.4 Facebook
- Groups community building
- Marketplace opportunities
- Meta Advantage campaigns
- Messaging automation

### 1.5 X (Twitter)
- Real-time marketing
- Customer service
- News và trending topics
- Threads feature

## 2. Content Trends 2024

### 2.1 Short-form Video
- 15-60 seconds optimal
- Vertical format
- Sound-on editing
- Quick hooks (first 3 seconds)

### 2.2 User-Generated Content
- Customer testimonials
- Reviews và unboxings
- Community highlights
- UGC campaigns

### 2.3 Behind-the-Scenes
- Authenticity focus
- Day-in-the-life content
- Process reveals
- Team introductions

### 2.4 Educational Content
- How-to tutorials
- Tips và tricks
- Industry insights
- Carousels và guides

## 3. Social Commerce

### 3.1 Shoppable Posts
- Product tagging
- In-app checkout
- Live shopping events
- Product catalogs

### 3.2 Influencer Commerce
- Affiliate programs
- Creator shops
- Sponsored content
- Brand ambassadors

## 4. Community Management

### 4.1 Engagement Best Practices
- Response time < 24 hours
- Personalized replies
- Emoji usage
- Community guidelines

### 4.2 Crisis Management
- Social listening
- Response protocols
- Escalation procedures
- Transparency focus

## 5. Analytics và Measurement

### 5.1 Key Metrics
- Reach và impressions
- Engagement rate
- Click-through rate
- Conversion tracking

### 5.2 Attribution
- UTM parameters
- Social-assisted conversions
- Multi-touch attribution
- ROI calculation

## Kết luận
Social media success trong 2024 requires agility, authenticity và strong community focus. Brands cần embrace new formats while maintaining consistent brand voice across platforms.`
  },
  {
    title: "Email Marketing Automation: Best Practices và Case Studies",
    author: "Mailchimp Research",
    url: "https://mailchimp.com/resources/email-automation-guide",
    published_date: "2024-01-28",
    tags: ["Email Marketing", "Automation", "Conversion", "Mailchimp"],
    content: `# Email Marketing Automation: Best Practices và Case Studies

## Introduction
Email marketing vẫn là channel có ROI cao nhất (4200% average ROI). Automation giúp scale personalization và nurture leads effectively.

## 1. Essential Email Sequences

### 1.1 Welcome Series
- Email 1: Welcome và brand story
- Email 2: Value proposition
- Email 3: Social proof
- Email 4: First purchase offer

**Best Practice**: 4-5 emails over 2 weeks, 40-50% higher open rates than regular campaigns.

### 1.2 Abandoned Cart
- Email 1: Reminder (1 hour after)
- Email 2: Social proof (24 hours)
- Email 3: Urgency/discount (48 hours)

**Best Practice**: Average recovery rate 10-15%, higher với personalized product images.

### 1.3 Post-Purchase
- Email 1: Order confirmation
- Email 2: Shipping update
- Email 3: Review request
- Email 4: Cross-sell recommendations

### 1.4 Re-engagement
- Email 1: "We miss you"
- Email 2: Special offer
- Email 3: Final attempt
- Unsubscribe inactive after 90 days

## 2. Personalization Strategies

### 2.1 Dynamic Content
- Name personalization
- Location-based content
- Behavior-triggered recommendations
- Purchase history integration

### 2.2 Segmentation
- Demographics
- Purchase behavior
- Engagement level
- Lifecycle stage

## 3. Email Design Best Practices

### 3.1 Mobile Optimization
- 60%+ emails opened on mobile
- Single column layout
- Large CTA buttons (44px minimum)
- Concise copy

### 3.2 Subject Lines
- 30-50 characters optimal
- Personalization increases open rates 26%
- Emojis: test for your audience
- A/B test consistently

### 3.3 Preheader Text
- Complement subject line
- 85-100 characters
- Include CTA

## 4. Deliverability Optimization

### 4.1 Technical Setup
- SPF, DKIM, DMARC authentication
- Warm up new domains/IPs
- Consistent sending schedule

### 4.2 List Hygiene
- Double opt-in
- Regular list cleaning
- Bounce management
- Unsubscribe handling

## 5. Case Studies

### 5.1 E-commerce Brand A
- Implemented abandoned cart sequence
- Result: 15% recovery rate, $200K additional revenue/year

### 5.2 SaaS Company B
- Onboarding email sequence
- Result: 40% increase in trial-to-paid conversion

### 5.3 D2C Brand C
- VIP customer segment with exclusive offers
- Result: 65% higher lifetime value

## 6. Metrics to Track

### 6.1 Engagement Metrics
- Open rate (benchmark: 20-25%)
- Click rate (benchmark: 2-5%)
- Click-to-open rate

### 6.2 Conversion Metrics
- Conversion rate
- Revenue per email
- List growth rate
- Unsubscribe rate

## Kết luận
Email automation là foundation của successful email marketing. Focus vào relevant, timely messages và continuous optimization để maximize ROI.`
  },
  {
    title: "Data-Driven Decision Making trong Business",
    author: "MIT Sloan Management Review",
    url: "https://sloanreview.mit.edu/data-driven-decisions",
    published_date: "2024-03-01",
    tags: ["Data", "Analytics", "Business Intelligence", "Decision Making"],
    content: `# Data-Driven Decision Making trong Business

## Executive Summary
Organizations áp dụng data-driven decision making có khả năng profitable cao hơn 23x và acquire customers hiệu quả hơn 6x so với competitors.

## 1. Framework Data-Driven Culture

### 1.1 Leadership Commitment
- Top-down data advocacy
- Data literacy training investment
- Clear data governance policies

### 1.2 Technology Infrastructure
- Modern data warehouse/lakehouse
- BI tools accessibility
- Data quality management

### 1.3 Process Integration
- Data trong daily workflows
- Automated reporting
- Self-service analytics

## 2. Key Performance Indicators (KPIs)

### 2.1 Defining Effective KPIs
- Aligned với business objectives
- Measurable và actionable
- Relevant cho stakeholders
- Time-bound

### 2.2 KPI Categories

**Financial KPIs**:
- Revenue growth rate
- Gross profit margin
- Customer acquisition cost (CAC)
- Customer lifetime value (CLV)
- Return on investment (ROI)

**Customer KPIs**:
- Net Promoter Score (NPS)
- Customer satisfaction (CSAT)
- Customer retention rate
- Churn rate

**Operational KPIs**:
- Conversion rate
- Average order value
- Time to market
- Employee productivity

## 3. Analytics Maturity Model

### 3.1 Level 1: Descriptive
- What happened?
- Historical reporting
- Dashboards và scorecards

### 3.2 Level 2: Diagnostic
- Why did it happen?
- Root cause analysis
- Drill-down capabilities

### 3.3 Level 3: Predictive
- What will happen?
- Forecasting models
- Trend analysis

### 3.4 Level 4: Prescriptive
- What should we do?
- Optimization algorithms
- AI recommendations

## 4. Implementation Roadmap

### Phase 1: Foundation (0-3 months)
- Data audit và assessment
- Tool selection
- Team training

### Phase 2: Building (3-6 months)
- Data pipeline setup
- Dashboard development
- Process documentation

### Phase 3: Scaling (6-12 months)
- Advanced analytics
- Self-service expansion
- Governance refinement

### Phase 4: Optimization (Ongoing)
- AI/ML integration
- Real-time analytics
- Continuous improvement

## 5. Common Pitfalls

### 5.1 Data Quality Issues
- "Garbage in, garbage out"
- Inconsistent definitions
- Missing data

### 5.2 Analysis Paralysis
- Too many metrics
- Lack of prioritization
- Delayed decisions

### 5.3 Siloed Data
- Department-specific systems
- No single source of truth
- Integration challenges

## 6. Case Study: Netflix

Netflix uses data để:
- Personalize recommendations (80% of watched content)
- Decide content production ($17B/year budget)
- Optimize streaming quality
- Predict subscriber behavior

Result: Industry-leading retention rate và global expansion success.

## Kết luận
Data-driven decision making là competitive advantage trong modern business. Success requires technology, culture và processes alignment. Start small, prove value, và scale systematically.`
  }
];

async function seedRAGLibrary() {
  console.log('🌱 Starting RAG Library seeding...\n');

  for (const doc of sampleDocuments) {
    try {
      console.log(`📄 Ingesting: ${doc.title}`);
      
      const response = await fetch('http://localhost:3001/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`   ✅ Success: ${result.data?.chunks_created || 0} chunks created\n`);
      } else {
        console.log(`   ❌ Error: ${result.error || result.message}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('\n🎉 RAG Library seeding completed!');
  console.log(`📊 Total documents: ${sampleDocuments.length}`);
}

seedRAGLibrary();




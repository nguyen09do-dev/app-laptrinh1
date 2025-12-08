import { db } from './src/lib/db.js';

async function seedData() {
  try {
    console.log('🌱 Seeding sample data...\n');

    // 1. Add sample ideas
    console.log('📝 Adding sample ideas...');
    await db.query(`
      INSERT INTO ideas (title, description, industry, persona, status, created_at)
      VALUES
        (
          'AI trong Marketing',
          'Ứng dụng trí tuệ nhân tạo để tối ưu hóa chiến dịch marketing và tăng ROI',
          'Marketing',
          'Marketing Manager',
          'approved',
          NOW()
        ),
        (
          'Blockchain trong Tài chính',
          'Cách công nghệ blockchain đang thay đổi ngành tài chính và banking',
          'Finance',
          'CFO',
          'approved',
          NOW()
        ),
        (
          'Remote Work Best Practices',
          'Các phương pháp làm việc từ xa hiệu quả cho doanh nghiệp',
          'Technology',
          'HR Manager',
          'approved',
          NOW()
        )
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample ideas added');

    // 2. Add sample briefs
    console.log('\n📋 Adding sample briefs...');
    const briefResult = await db.query(`
      INSERT INTO briefs (
        idea_id,
        title,
        objective,
        target_audience,
        key_messages,
        tone,
        tone_style,
        status,
        created_at
      )
      VALUES
        (
          (SELECT id FROM ideas WHERE title = 'AI trong Marketing' LIMIT 1),
          'AI Marketing: Tăng ROI với Automation',
          'Giúp marketer hiểu và áp dụng AI vào chiến dịch marketing',
          'Marketing managers, CMO, Digital marketers',
          'AI giúp tự động hóa, phân tích dữ liệu, cá nhân hóa trải nghiệm khách hàng',
          'Professional',
          'professional',
          'approved',
          NOW()
        ),
        (
          (SELECT id FROM ideas WHERE title = 'Blockchain trong Tài chính' LIMIT 1),
          'Blockchain: Cách mạng hóa ngành tài chính',
          'Giải thích cách blockchain thay đổi tài chính',
          'CFO, Financial managers, Fintech leaders',
          'Minh bạch, bảo mật, giảm chi phí giao dịch',
          'Technical',
          'professional',
          'approved',
          NOW()
        ),
        (
          (SELECT id FROM ideas WHERE title = 'Remote Work Best Practices' LIMIT 1),
          'Remote Work: 10 Best Practices cho 2025',
          'Chia sẻ kinh nghiệm làm việc từ xa hiệu quả',
          'HR managers, Team leads, Remote workers',
          'Giao tiếp, công cụ, văn hóa làm việc, work-life balance',
          'Casual',
          'casual',
          'approved',
          NOW()
        )
      ON CONFLICT DO NOTHING
      RETURNING id, title
    `);
    console.log('✅ Sample briefs added');
    console.table(briefResult.rows);

    // 3. Check data
    console.log('\n📊 Database summary:');

    const ideasCount = await db.query('SELECT COUNT(*) FROM ideas');
    const briefsCount = await db.query('SELECT COUNT(*) FROM briefs');
    const packsCount = await db.query('SELECT COUNT(*) FROM content_packs');
    const contentsCount = await db.query('SELECT COUNT(*) FROM contents');

    console.log(`
  Ideas: ${ideasCount.rows[0].count}
  Briefs: ${briefsCount.rows[0].count}
  Packs: ${packsCount.rows[0].count}
  Contents: ${contentsCount.rows[0].count}
    `);

    console.log('✅ Sample data seeding completed!\n');
  } catch (error: any) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  } finally {
    await db.end();
  }
}

seedData();

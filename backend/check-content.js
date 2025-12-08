import { db } from './src/lib/db.js';

(async () => {
  try {
    console.log('=== CHECKING PACK CONTENT ===');
    const packRes = await db.query(
      "SELECT pack_id, brief_id, word_count, LENGTH(draft_content) as len, SUBSTRING(draft_content, 1, 600) as preview FROM content_packs WHERE status = 'published' ORDER BY created_at DESC LIMIT 1"
    );

    if (packRes.rows[0]) {
      console.log('Pack ID:', packRes.rows[0].pack_id);
      console.log('Word count:', packRes.rows[0].word_count);
      console.log('Content length:', packRes.rows[0].len);
      console.log('\nContent preview:');
      console.log(packRes.rows[0].preview);
    } else {
      console.log('No published packs found');
    }

    console.log('\n\n=== CHECKING CONTENT BODY ===');
    const contentRes = await db.query(
      'SELECT id, brief_id, word_count, LENGTH(body) as len, SUBSTRING(body, 1, 600) as preview FROM contents ORDER BY created_at DESC LIMIT 1'
    );

    if (contentRes.rows[0]) {
      console.log('Content ID:', contentRes.rows[0].id);
      console.log('Word count:', contentRes.rows[0].word_count);
      console.log('Body length:', contentRes.rows[0].len);
      console.log('\nBody preview:');
      console.log(contentRes.rows[0].preview);
    } else {
      console.log('No contents found');
    }

    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

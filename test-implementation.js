const https = require('http');

https.get('http://localhost:3001/api/ideas', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const ideasWithoutImpl = json.data.filter(i => !i.implementation);
    const ideasWithImpl = json.data.filter(i => i.implementation);

    console.log('\n📊 IMPLEMENTATION FEATURE TEST RESULTS:');
    console.log('=====================================\n');
    console.log(`Total ideas: ${json.data.length}`);
    console.log(`Ideas with implementation: ${ideasWithImpl.length}`);
    console.log(`Ideas without implementation: ${ideasWithoutImpl.length}\n`);

    if (ideasWithImpl.length > 0) {
      console.log('✅ Ideas with implementation (should hide button):');
      ideasWithImpl.slice(0, 3).forEach(i => {
        const impl = i.implementation;
        console.log(`   - ID ${i.id}: "${i.title}"`);
        console.log(`     Steps: ${impl.steps?.length || 0}, Feasibility: ${impl.feasibility?.score || 'N/A'}`);
      });
    }

    if (ideasWithoutImpl.length > 0) {
      console.log('\n🔘 Ideas without implementation (should show button):');
      ideasWithoutImpl.slice(0, 3).forEach(i => {
        console.log(`   - ID ${i.id}: "${i.title}"`);
      });
    }

    console.log('\n=====================================\n');
  });
});

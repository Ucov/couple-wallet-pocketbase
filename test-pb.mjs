import PocketBase from 'pocketbase';

const pb = new PocketBase('http://192.168.1.11:8090');

async function runTest() {
  try {
    const coupleId = 'ea2qgsi5irdykzc';
    console.log("Attempting to fix couple name without auth...");
    const updated = await pb.collection('couples').update(coupleId, {
      join_code: 'TEST77'
    });
    console.log("SUCCESS!", updated);
  } catch (err) {
    console.error("ERROR:", err.message);
    if (err.data) {
      console.error(JSON.stringify(err.data, null, 2));
    }
  }
}

runTest();

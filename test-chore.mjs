import PocketBase from 'pocketbase';

const pb = new PocketBase('http://192.168.1.11:8090');

async function test() {
  try {
    console.log("Fetching chores...");
    const chores = await pb.collection('chores').getFullList();
    if (chores.length === 0) {
      console.log("No chores found.");
      return;
    }
    const chore = chores[0];
    console.log("Found chore:", chore.id, chore.title, "Status:", chore.is_done);
    
    console.log("Trying to update is_done to true...");
    const updated = await pb.collection('chores').update(chore.id, { is_done: true });
    console.log("Success! Updated status:", updated.is_done);
  } catch (err) {
    console.error("Error from PocketBase:");
    console.error(err.response || err);
  }
}
test();

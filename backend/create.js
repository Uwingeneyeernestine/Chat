const {MongoClient} = require('mongodb');

const url = 'mongodb://localhost:27017';
let db = '';

async function main() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    db = client.db('sign');
    const user = {"name":"Ernestine","pass":"it's me"};
    
    const result = await db.collection('users').insertOne(user);
    console.log('User inserted successfully:', result.insertedId);
    
  } catch (err) {
    console.log('Database error:', err.message);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

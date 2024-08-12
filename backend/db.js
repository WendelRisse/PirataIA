// backend/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://Wendel:<1234>@wendel.9eamttz.mongodb.net/?retryWrites=true&w=majority&appName=Wendel";

const client = new MongoClient(uri, {
  sslKey: credentials,
  sslCert: credentials,
  serverApi: ServerApiVersion.v1,
});

async function connectToDatabase() {
  try {
    await client.connect();
    const database = client.db('testDB');
    const collection = database.collection('testCol');
    const docCount = await collection.countDocuments({});
    console.log(`Número de documentos na coleção: ${docCount}`);
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  } finally {
    await client.close();
  }
}

module.exports = connectToDatabase;

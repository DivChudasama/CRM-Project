const mongoose = require('mongoose');

const uri = 'mongodb://crm_db_user:bCrh1L4XAjk1ICyX@ac-dxqbzfh-shard-00-00.ikwtupo.mongodb.net:27017,ac-dxqbzfh-shard-00-01.ikwtupo.mongodb.net:27017,ac-dxqbzfh-shard-00-02.ikwtupo.mongodb.net:27017/?ssl=true&replicaSet=atlas-b0sfx1-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log('SUCCESS: Connected to DB');
  process.exit(0);
}).catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});

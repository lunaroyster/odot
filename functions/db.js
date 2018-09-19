const admin = require('firebase-admin');

const db = admin.firestore();
db.settings({
  timestampsInSnapshots: true
});

module.exports = db;
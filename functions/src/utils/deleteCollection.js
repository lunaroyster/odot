//adapted from https://github.com/firebase/snippets-node/blob/c47a53815f88d11369ddfb9afec323471c865836/firestore/main/index.js#L822-L861
async function deleteCollection(db, path, batchSize) {
  let query = db.collection(path).orderBy('__name__').limit(batchSize);
  return new Promise((resolve, reject) => deleteQueryBatch(db, query, batchSize, resolve, reject));
}

async function deleteQueryBatch(db, query, resolve, reject) {
  try {
    let snapshot = await query.get();
    if (snapshot.size == 0) return resolve();
    
    let batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    process.nextTick(async () => await deleteQueryBatch(db, query, resolve, reject));
  } catch(error) {
    reject(error);
  }
}

module.exports = deleteCollection;
const db = require('./db');
const deleteCollection = require('./utils/deleteCollection');

function getMatches (regex, text) {
  let matches = [];
  let match;
  while ((match = regex.exec(text)) != null) {
    matches.push(match[1]);
  }
  return matches;
}
function getUsers (text) {
  let users = getMatches(/<@(\w+)(?:\|([a-z0-9][a-z0-9._-]+))?>/g, text);
  let userObject = {};
  users.forEach(u => userObject[u] = true);
  return userObject;
}
function getChannels (text) {
  let channels = getMatches(/<#(\w+)(?:\|([a-z0-9-_]+))?>/g, text);
  let channelObject = {};
  channels.forEach(c => channelObject[c] = true);
  return channelObject;
}

async function createOdot(task, teamID, creator, createdIn) {
  let getRandom = ()=>Math.floor(Math.random()*(36**4-1)).toString(36);
  let taskObject = {
    task,
    creation: new Date(),
    completed: false,
    channels: getChannels(task),
    creator,
    createdIn,
    users: getUsers(task),
  };
  await db.runTransaction(async txn => {
    let tasksRef = db.collection(`teams/${teamID}/tasks`);
    let id;
    while (true) {
      let testId = getRandom();
      let taskDoc = await txn.get(tasksRef.doc(testId));
      if (taskDoc.exists) continue;
      id = testId;
      break;
    }
    await txn.set(tasksRef.doc(id), taskObject);
  });
}

async function getOdots(teamID) {
  let odotsSnapshot = await db.collection('teams').doc(teamID).collection('tasks').get();
  let odots = [];
  odotsSnapshot.forEach(doc=> {
    odots.push(doc.data().task);
  });
  return odots;
}

async function wipeAllTeamTasks(teamID) {
  await deleteCollection(db, `teams/${teamID}/tasks`, 10);
}

module.exports = {
  createOdot,
  getOdots,
  wipeAllTeamTasks,
};
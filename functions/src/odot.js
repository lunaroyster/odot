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
function getEntities(text) {
  return {
    channels: getChannels(text),
    users: getUsers(text)
  };
}

async function createOdot(task, teamID) {
  let taskObject = {
    task,
    time: new Date(),
    completed: false,
    ...getEntities(task)
  };
  await db.collection('teams').doc(teamID).collection('tasks').add(taskObject);
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
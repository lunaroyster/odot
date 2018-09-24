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

let tasksRef = teamID => db.collection(`teams/${teamID}/tasks`);

let getOdotsFromSnapshot = snapshot => {
  let odots = [];
  snapshot.forEach(doc=> {
    odots.push({...doc.data(), id: doc.id});
  });
  return odots;
};

let uniqueArrayByKey = (key, ...arrays) => {
  let uniqueMap = {};
  arrays.forEach(array => {
    array.forEach(element => {
      uniqueMap[element[key]] = element;
    });
  });
  return Object.values(uniqueMap);
};

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
  let result = await db.runTransaction(async txn => {
    let id;
    while (true) {
      let testId = getRandom();
      let taskDoc = await txn.get(tasksRef(teamID).doc(testId));
      if (taskDoc.exists) continue;
      id = testId;
      break;
    }
    await txn.set(tasksRef(teamID).doc(id), taskObject);
    return {...taskObject, id};
  });
  return result;
}

async function markOdotAsComplete(odotID, teamID) {
  let result = await db.runTransaction(async txn => {
    let odotRef = tasksRef(teamID).doc(odotID);
    let odotDoc = await txn.get(odotRef);
    if(!odotDoc.exists) return; //return failure
    if(!odotDoc.data().completed) {
      await txn.update(odotRef, {completed: true});
    }
  });
  return result;
}

async function deleteOdot(odotID, teamID) {
  let odotRef = tasksRef(teamID).doc(odotID);
  await odotRef.delete();
}

async function getOdots(teamID) {
  let odotsSnapshot = await tasksRef(teamID).get();
  return getOdotsFromSnapshot(odotsSnapshot);
}

async function getUserReferencedOdots(userID, teamID) {
  let odotsSnapshot = await tasksRef(teamID).where(`users.${userID}`, '==', true).get();
  return getOdotsFromSnapshot(odotsSnapshot);
}

async function getUserCreatedOdots(userID, teamID) {
  let odotsSnapshot = await tasksRef(teamID).where("creator", '==', userID).get();
  return getOdotsFromSnapshot(odotsSnapshot);
}

async function getUserRelatedOdots(userID, teamID) {
  let referencedOdots = getOdotsFromSnapshot(await tasksRef(teamID).where(`users.${userID}`, '==', true).get());
  let createdOdots = getOdotsFromSnapshot(await tasksRef(teamID).where("creator", '==', userID).get());
  return uniqueArrayByKey('id', referencedOdots, createdOdots);
}

async function getChannelReferencedOdots(channelID, teamID) {
  let odotsSnapshot = await tasksRef(teamID).where(`channels.${channelID}`, '==', true).get();
  return getOdotsFromSnapshot(odotsSnapshot);
}

async function getChannelCreatedOdots(channelID, teamID) {
  let odotsSnapshot = await tasksRef(teamID).where("createdIn", '==', channelID).get();
  return getOdotsFromSnapshot(odotsSnapshot);
}

async function getChannelRelatedOdots(channelID, teamID) {
  let referencedOdots = getOdotsFromSnapshot(await tasksRef(teamID).where(`channels.${channelID}`, '==', true).get());
  let createdOdots = getOdotsFromSnapshot(await tasksRef(teamID).where("createdIn", '==', channelID).get());
  return uniqueArrayByKey('id', referencedOdots, createdOdots);
}

async function wipeAllTeamTasks(teamID) {
  await deleteCollection(db, `teams/${teamID}/tasks`, 10);
}

module.exports = {
  createOdot,
  getOdots,
  wipeAllTeamTasks,
  markOdotAsComplete,
  deleteOdot,
  getUserReferencedOdots,
  getUserCreatedOdots,
  getUserRelatedOdots,
};
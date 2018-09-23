const functions = require('firebase-functions');
const firebase = require('./src/firebase');

const db = require('./src/db');

const execInteraction = require('./src/interacts');
exports.interact = functions.https.onRequest(execInteraction);

const execCommand = require('./src/commands');
exports.command = functions.https.onRequest(execCommand);

// exports.option = functions.https.onRequest()
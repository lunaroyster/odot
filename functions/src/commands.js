const db = require('./db');
const odot = require('./odot');

let commands = {
};

module.exports = async function(req, res) {
  await commands[req.body.command](req, res);
};
const db = require('./db');
const odot = require('./odot');

let commands = {
  '/o': async function(req, res) {
    await odot.createOdot(req.body.text, req.body.team_id);
    res.status(201).send({
      text: `Added task: ${req.body.text}`
    });
  },
};

module.exports = async function(req, res) {
  await commands[req.body.command](req, res);
};
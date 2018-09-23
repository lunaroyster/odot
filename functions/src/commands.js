const db = require('./db');
const odot = require('./odot');

let commands = {
  '/o': async function(req, res) {
    await odot.createOdot(req.body.text, req.body.team_id);
    res.status(201).send({
      text: `Added task: ${req.body.text}`
    });
  },
  '/odot': async function(req, res) {
    if(req.body.text == 'nuke') {
      await odot.wipeAllTeamTasks(req.body.team_id);
      res.status(200).send({text: `Nuked all odots for ${req.body.team_domain}`});
    }
  },
};

module.exports = async function(req, res) {
  await commands[req.body.command](req, res);
};
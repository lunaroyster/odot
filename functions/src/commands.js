const db = require('./db');
const odot = require('./odot');
const axios = require('axios');

let commands = {
  '/o': async function(req, res) {
    await odot.createOdot(req.body.text, req.body.team_id, req.body.user_id, req.body.channel_id);
    res.status(201).send({text: `Added task: ${req.body.text}`});
  },
  '/odots': async function(req, res) {
    let odots = await odot.getOdots(req.body.team_id);
    res.status(200).send({
      text: `*Here are your odots*:\n${odots.map((o, p)=>`>${p+1}: ${o}`).join('\n')}`,
      mrkdwn: true,
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
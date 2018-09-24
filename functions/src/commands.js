const db = require('./db');
const odot = require('./odot');
const axios = require('axios');

let commands = {
  '/o': async function({ body }, res) {
    let { text, team_id, user_id, channel_id } = body;
    let o = await odot.createOdot(text, team_id, user_id, channel_id);
    res.status(201).send({text: `Added task \`${o.id}\`: ${o.task}`});
  },
  '/dot': async function({ body }, res) {
    let { text, team_id } = body;
    if (text.length==4) {
      await odot.markOdotAsComplete(text, team_id);
      res.status(200).send({text: `Completed task \`${text}\``});
    } else if (text.length==0) {
      //TODO: GUI mode
    }
  },
  '/odots': async function({ body }, res) {
    let odots = await odot.getUserRelatedOdots(body.user_id, body.team_id);
    res.status(200).send({
      text: `*Here are your odots*:\n${odots.map((o, p)=>`>\`${o.id}\`: ${o.task}`).join('\n')}`,
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
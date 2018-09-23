const axios = require('axios');
const db = require('./db');
const odot = require('./odot');

let interacts = {
  'create_odot': async function({ payload }, res) {
    await odot.createOdot(payload.message.text, payload.team.id, payload.user.id, payload.channel.id);
    res.status(200).send();
    await axios.post(payload.response_url, {
      text: `Added task: ${payload.message.text}`
    });
  },
};

module.exports = async function(req, res) {
  req.payload = JSON.parse(req.body.payload);
  await interacts[req.payload.callback_id](req, res);
};
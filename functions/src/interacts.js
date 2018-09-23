const axios = require('axios');
const db = require('./db');
const odot = require('./odot');

let interacts = {
};

module.exports = async function(req, res) {
  let payload = JSON.parse(req.body.payload);
  await interacts[payload.callback_id](req, res);
};
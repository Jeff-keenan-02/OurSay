const crypto = require('crypto');

function generateActionToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateActionToken
};
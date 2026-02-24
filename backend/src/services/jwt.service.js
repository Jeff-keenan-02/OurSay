const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt.config");

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = {
  generateToken,
  verifyToken,
};
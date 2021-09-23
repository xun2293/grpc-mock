const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports = function (username) {
  const token = jwt.sign(
    {
      username: username
    },
    config.key,
    {
      expiresIn: '7d'
    }
  );

  return token
};

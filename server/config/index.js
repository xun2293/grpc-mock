const envConfig = require(`./${process.env.NODE_ENV}.env`);
module.exports = envConfig;

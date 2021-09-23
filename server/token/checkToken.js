const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports = async (ctx, next) => {
  let url = ctx.request.url;
  console.log('url =', url);
  if (url.indexOf('login') === -1 && url.indexOf('register') === -1) {
    console.log('check token');
    // 检验是否存在 token
    const authorization = ctx.get('Authorization');
    if (authorization === '') {
      ctx.status = 401;
      ctx.body = {
        msg: "no token"
      };
      return
    }
    const token = authorization.split(' ')[1];
    // 检验 token 是否已过期
    try {
      await jwt.verify(token, config.key);
      let decoded = jwt.decode(token);
      ctx.username = decoded.username;
      ctx.req.username = decoded.username;
      console.log('decoded=', decoded);
    } catch (err) {
      ctx.status = 401;
      ctx.body = {
        msg: "invalid token"
      };
      return
    }
  }
  await next()
};

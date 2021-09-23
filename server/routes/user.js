const router = require('koa-router')();
const crypto = require('crypto');
const User = require('../dbs/models/users').Users;
const Joi = require('@hapi/joi');

const createToken = require('../token/createToken.js'); // 创建token

router.prefix('/api');

const registerSchema = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9]*$/).required(),
  password: Joi.string().min(6).required(),
  passwordConfirm: Joi.string().min(6).required(),
  email:  Joi.string().required(),
});

// 接口 - 注册
router.post('/register', async ctx => {
  let response = {};
  let req = ctx.request.body;
  response.code = 0;
  let error = registerSchema.validate(req).error;
  if (error != null) {
    response.code = -1;
    response.msg = error.details[0].message;
  } else {
    const { username, password, passwordConfirm, email } = ctx.request.body;
    if (password !== passwordConfirm) {
      response.code = -1;
      response.msg = '两次密码不一致';
    } else {
      const user = await User.find({ username });
      if (user.length) {
        response.code = -1;
        response.msg = '该用户名已被注册';
      } else {
        // 查询当前用户数量，第一个用户为管理员
        const count = await User.countDocuments({});
        let auth = 0;
        if (count === 0) {
          auth = 1;
        }
        const md5sum = crypto.createHash('md5');
        const md5pass = md5sum.update(password).digest('hex');
        // 如果用户名未被注册，则写入数据库
        const newUser = await User.create({
          username,
          password: md5pass,
          email,
          auth,
          token: ''
        });
        if (!newUser) {
          response.code = -1;
          response.msg = '注册失败';
        } else {
          response.msg= '注册成功';
        }
      }
    }
  }
  ctx.body = response;
});

// 接口 - 登录
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

router.post('/login', async (ctx, next) => {
  let response = {};
  let req = ctx.request.body;
  let error = loginSchema.validate(req).error;
  if (error != null) {
    response.code = -1;
    response.msg = error.details[0].message;
  } else {
    const { username, password } = ctx.request.body;
    const md5sum = crypto.createHash('md5');
    const md5pass = md5sum.update(password).digest('hex');
    let doc = await User.findOne({ username });
    if (!doc) {
      console.log('该用户不存在');
      response.code = -1;
      response.msg = '用户名不存在';
    } else if (doc.password !== md5pass) {
      response.code = -1;
      response.msg = '密码错误';
    } else if (doc.password === md5pass) {
      let token = createToken(username);
      console.log(token);
      doc.token = token;
      try {
        await doc.save();
        response.code = 0;
        response.msg = '登录成功';
        response.data = {username: username, token: token};
      } catch (err) {
        response.code = -1;
        response.msg = '登录失败，请重新登录';
      }
    }
  }
  ctx.body = response;
});

module.exports = router;


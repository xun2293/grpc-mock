const Koa = require('koa');
const app = new Koa();
const mongoose = require('mongoose');
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const path = require("path");
const checkToken = require('./token/checkToken.js'); // 验证token

const mock = require('./routes/mock');
const fileManager = require('./routes/file-manager');
const user = require('./routes/user');
// error handler
onerror(app);

// middlewares
app.use(cors());
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});
const config = require('./config');
// 连接数据库
mongoose.connect(
  config.dbs,
  { useNewUrlParser: true }
);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;
mongoose.Promise = global.Promise;
db.on('error', function () {
  console.log('数据库连接出错')
});
db.on('open', function () {
  console.log('数据库连接成功')
});
app.use(async (ctx, next) => {
  ctx.config = config;
  //console.log('config:', config);
  await next();
} );
app.use(checkToken);
// routes
app.use(mock.routes(), mock.allowedMethods());
app.use(fileManager.routes(), fileManager.allowedMethods());
app.use(user.routes(), user.allowedMethods());
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app;

const router = require('koa-router')();
// const Redis = require("ioredis");
const Mock = require('../dbs/models/mocks').Mocks;
// const config = require('../config');
// const redis = new Redis(config.redisConfig.port, config.redisConfig.host);
const fs = require('fs');
const path = require("path");
const Joi = require('@hapi/joi');
const crypto = require('crypto');

const MockServer = require('../mock-server/proto-mock');
const ProtoParser = require('../mock-server/proto-parser');
const mockServer = new MockServer();

const {isProtoFile, listFile, getUploadDir} = require('../utils/file-utils');


function genId(packageName, service, method) {
  const md5sum = crypto.createHash('md5');
  return md5sum.update(packageName + service + method).digest('hex');
}

function addObjToService(obj, username) {
  let protoDir = getUploadDir(username);
  let rpc = ProtoParser.parse(path.join(protoDir, obj.protocol), protoDir);
  let rpcService = rpc.getRpcService(obj.packageName, obj.service, obj.method);
  if (rpcService == null) {
    return false;
  }
  return mockServer.addService(obj.id, rpcService, obj.method, obj.message);
}

router.prefix('/api');

// 获取协议列表
router.get('/getProtocol', async (ctx, next) => {
  let list = [];
  listFile(getUploadDir(ctx.username), list);
  list = list.filter(filepath => isProtoFile(filepath));
  // 展示的就不加dirname了
  list.forEach((item, index, theList) => {
    theList[index] = item.slice(getUploadDir(ctx.username).length + 1, item.length);
  });
  let reponse = {};
  reponse.code = 0;
  reponse.data = list;
  ctx.body = reponse;
});

// 解析协议获取服务
router.get('/getServiceAndName', async (ctx, next) => {
  let reponse = {};
  reponse.code = 0;
  let protocol = ctx.request.query.protocol;
  if (protocol) {
    try {
      let rpc = ProtoParser.parse(path.join(getUploadDir(ctx.username), protocol), getUploadDir(ctx.username));
      reponse.data = rpc.toObject();
    } catch (e) {
      reponse.code = -1;
      reponse.msg = e.message;
    }

  } else {
    reponse.code = -1;
    reponse.msg = 'no file';
  }
  ctx.body = reponse;
});

// ===================================
// 以下是mock service相关操作
const addSchema = Joi.object({
  protocol: Joi.string().required(),
  packageName: Joi.string().required(),
  service:  Joi.string().required(),
  method:   Joi.string().required(),
  message: Joi.object().required(),
  source: Joi.number().required()
});

router.post('/add', async (ctx, next) => {
  let response = {};
  let req = ctx.request.body;
  console.log('req = ', req);
  response.code = 0;
  let error = addSchema.validate(req).error;
  if (error != null) {
    response.code = -1;
    response.msg = error.details[0].message;
  } else {
    let protocol = req.protocol;
    let packageName = req.packageName;
    let service = req.service;
    let method = req.method;
    let message = req.message;
    let source = req.source;
    // 保存用户名
    req.username = ctx.username;
    req.isEnable = true;
    req.id = genId(packageName, service, method);
    try {
      let result = await Mock.findOne({id: req.id});
      if (result === null) {
        await Mock.create({
          id: req.id,
          protocol,
          packageName,
          service,
          method,
          message,
          source,
          isEnable: req.isEnable,
          username: req.username
        });
        response.msg = '添加成功';
        // 启动则添加到mock service
        if (mockServer.isStart) {
          let serviceResult = addObjToService(req, req.username);
          if (!serviceResult) {
            response.code = -1;
            response.msg = '添加service失败';
          }
        }
      } else {
        response.code = -1;
        response.msg = '添加失败: 重复添加';
      }
    } catch (e) {
      response.code = -1;
      response.msg = '添加失败';
    }
  }
  ctx.body = response;
});

const deleteSchema = Joi.object({
  id: Joi.string().required()
});

router.post('/delete', async (ctx, next) => {
  let response = {};
  let req = ctx.request.body;
  console.log('req = ', req);
  response.code = 0;
  let error = deleteSchema.validate(req).error;
  if (error != null) {
    response.code = -1;
    response.msg = error.details[0].message;
  } else {
    try {
      await Mock.deleteOne({id: req.id});
      response.msg = '删除成功';
    } catch (e) {
      response.code = -1;
      response.msg = e.message;
    }
  }
  ctx.body = response;
});

const enableSchema = Joi.object({
  id: Joi.string().required(),
  isEnable: Joi.boolean().required(),
});

router.post('/enable', async (ctx, next) => {
  let response = {};
  let req = ctx.request.body;
  console.log('req =', req);
  response.code = 0;
  response.msg = '操作成功';
  let error = enableSchema.validate(req).error;
  if (error != null) {
    response.code = -1;
    response.msg = error.details[0].message;
  } else {
    try {
      let result = await Mock.findOne({id: req.id});
      if (result === null) {
        response.code = -1;
        response.msg = '操作失败';
      } else {
        let isEnable = req.isEnable;
        result.isEnable = isEnable;
        await Mock.updateOne(result);
        if (mockServer.isStart) {
          if (isEnable) {
            let serviceResult = addObjToService(result, result.username);
            if (!serviceResult) {
              response.code = -1;
              response.msg = '添加service失败';
            }
          } else {
            mockServer.removeService(req.id);
          }
        }
      }
    } catch (e) {
      console.log(e);
      response.code = -1;
      response.msg = e.message;
    }
  }
  ctx.body = response;
});

const updateSchema = Joi.object({
  id: Joi.string().required(),
  message: Joi.object().required()
});

router.post('/update', async (ctx, next) => {
  let response = {};
  let req = ctx.request.body;
  console.log('req = ', req);
  response.code = 0;
  response.msg = '操作成功';
  let error = updateSchema.validate(req).error;
  if (error != null) {
    response.code = -1;
    response.msg = error.details[0].message;
  } else {
    try {
      let result = await Mock.findOne({id: req.id});
      if (result === null) {
        response.code = -1;
        response.msg = '操作失败';
      } else {
        result.message = req.message;
        await Mock.updateOne(result);
        if (mockServer.isStart) {
          mockServer.removeService(result.id);
          let serviceResult = addObjToService(result, result.username);
          if (!serviceResult) {
            response.code = -1;
            response.msg = '添加service失败';
          }
        }
      }
    } catch (e) {
      response.code = -1;
      response.msg = e.message;
    }
  }
  console.log('response =', response);
  ctx.body = response;
});

router.get('/list', async (ctx, next) => {
  let response = {};
  response.code = 0;
  let values = await Mock.find({});
  console.log('values =', values);
  response.data = [];
  for (const value of values) {
    response.data.push(value);
  }
  ctx.body = response;
});

router.get('/getStatus', async (ctx, next) => {
  let response = {};
  response.code = 0;
  response.data = {status: mockServer.isStart};
  ctx.body = response;
});

// 启动mock server
router.post('/startServer', async (ctx, next) => {
  let response = {};
  response.code = 0;
  response.msg = '启动成功';
  if (mockServer.isStart) {
    response.code = -1;
    response.msg = '已经启动';
  } else {
    try {
      let startResult = await mockServer.startAsync();
      let values = await Mock.find({});
      console.log('values = ', values);
      for (const value of values) {
        if (value.isEnable) {
          let serviceResult = addObjToService(value, value.username);
          if (!serviceResult) {
            response.code = -1;
            response.msg = '添加service失败';
            break;
          }
        }
      }
    } catch (e) {
      console.log(e);
      response.code = -1;
      response.msg = e.message;
    }
  }
  ctx.body = response;
});

router.post('/stopServer', async (ctx, next) => {
  let response = {};
  response.code = 0;
  if (mockServer.isStart) {
    // remove all service
    let values = await Mock.find({});
    for (const value of values) {
      mockServer.removeService(value.id);
    }
    mockServer.stop();
  }
  response.msg = '停止成功';
  ctx.body = response;
});

module.exports = router;

const router = require('koa-router')();
const fs = require('fs');
const path = require('path');
const Joi = require('@hapi/joi');
const AdmZip = require('adm-zip');

const {isProtoFile, isZipFile, fileTree, getUploadDir} = require('../utils/file-utils');

router.prefix('/api');

router.get('/getFileTree', async (ctx, next) => {
  let tree = {
    name: '/',
    childs: [],
    files: [],
    path: '/'
  };
  console.log('username=', ctx.username);
  fileTree(getUploadDir(ctx.username), getUploadDir(ctx.username), tree);
  let reponse = {};
  reponse.code = 0;
  reponse.data = [tree];
  ctx.body = reponse;
});

const deletePathSchema = Joi.object({
  path: Joi.string().required()
});

router.post('/deletePath', async (ctx, next) => {
  let response = {};
  let req = ctx.request.body;
  console.log('req = ', req);
  response.code = 0;
  response.msg = '删除成功';
  let error = deletePathSchema.validate(req).error;
  if (error != null) {
    response.code = -1;
    response.msg = error.details[0].message;
  } else {
    try {
      if (req.path === '/') {
        fs.readdirSync(getUploadDir(ctx.username)).forEach(item => {
          let fullpath = path.join(getUploadDir(ctx.username), item);
          let stats = fs.statSync(fullpath);
          if (stats.isFile()) {
            fs.rmSync(fullpath);
          }
        });
        response.msg = '清空成功';
      } else if (req.path.indexOf('..') === -1) {
        let distDir = path.join(getUploadDir(ctx.username), req.path);
        if (fs.existsSync(distDir)) {
          fs.rmSync(distDir, {'recursive': true});
        }
      } else {
        response.code = -1;
        response.msg = '路径错误';
      }
    } catch (e) {
      response.code = -1;
      response.msg = e.message;
    }
  }
  ctx.body = response;
});

const multer = require('@koa/multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let chooseDir = req.body.chooseDir;
    let distDir = path.join(getUploadDir(req.username), chooseDir);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    cb(null, distDir)
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({storage}); // note you can pass `multer` options here

router.post(
  '/upload',
  upload.single('file'),
  async (ctx, next) => {
    const file = ctx.request.file;
    console.log('ctx.request.file', file);
    if (isZipFile(file.path)) {
      const dir = file.destination;
      const zip = new AdmZip(file.path);
      const zipEntries = zip.getEntries(); // an array of ZipEntry records
      zipEntries.forEach(function(zipEntry) {
        let entryName = zipEntry.entryName;
        if (entryName.indexOf('__MACOSX') === -1
          && entryName.indexOf('..') === -1
          && isProtoFile(entryName)
          && !zipEntry.isDirectory) {
          let newPath = path.join(dir, entryName);
          let entryDir = path.dirname(newPath);
          if (!fs.existsSync(entryDir)) {
            fs.mkdirSync(entryDir, { recursive: true });
          }
          fs.writeFile(newPath, zipEntry.getData(), (err) => {
            if (err) throw err;
            console.log(`save ${newPath} ok`);
          });
        }
        //console.log(zipEntry.toString()); // outputs zip entries information
        //console.log(zipEntry.getData().toString('utf8'));
      });
    }
    console.log('ctx.request.body', ctx.request.body);
    ctx.body = 'done';
  }
);
module.exports = router;

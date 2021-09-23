'use strict';

const fs = require('fs');
const path = require('path');
const Constant = require('./constant');
function isProtoFile(filepath) {
  return filepath.split('.').pop() === 'proto';
}

function isZipFile(filepath) {
  return filepath.split('.').pop() === 'zip'
}

function listFile(dir, list) {
  fs.readdirSync(dir).forEach(item => {
    let fullpath = path.join(dir, item);
    let stats = fs.statSync(fullpath);
    if (stats.isDirectory()) {
      listFile(fullpath, list);
    } else {
      list.push(fullpath);
    }
  });
}

function fileTree(rootDir, dir, tree) {
  fs.readdirSync(dir).forEach(item => {
    let fullpath = path.join(dir, item);
    let stats = fs.statSync(fullpath);
    if (stats.isDirectory()) {
      let child = {
        name: item,
        childs: [],
        files: [],
        path: '/' + path.relative(rootDir, fullpath)
      };
      tree.childs.push(child);
      fileTree(rootDir, fullpath, child);
    } else {
      if (isProtoFile(fullpath)) {
        tree.files.push(path.relative(dir, fullpath));
      }
    }
  });
}

function getUploadDir(username) {
  let rootDir = Constant.uploadDir + '/' + username;
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  return rootDir;
}

module.exports = {isProtoFile, isZipFile, listFile, fileTree, getUploadDir};

const {Rpc, Package, Service, Method, Message} = require('./proto-service');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require("path");

class ProtoParser {

  static computeIncludeDirs(filepath, rootDir) {
    let includeDirs = [];
    let dirname = path.dirname(filepath);
    while (dirname !== rootDir) {
      includeDirs.push(dirname);
      dirname = path.dirname(dirname)
    }
    includeDirs.push(dirname);
    return includeDirs;

  }

  static parse(filepath, rootDir) {
    let parser = new ProtoParser(filepath, ProtoParser.computeIncludeDirs(filepath, rootDir));
    return parser.startParse();
  }

  constructor(filepath, includeDirs) {
    this.packageDef = protoLoader.loadSync(
      filepath,
      {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: includeDirs
      });
    this.grpcResult = grpc.loadPackageDefinition(this.packageDef);
    this.rpc = new Rpc(filepath);
  }

  startParse() {
    this._parseService();
    return this.rpc;
  }

  _parseService() {
    for (const key of Object.keys(this.packageDef)) {
      const value = this.packageDef[key];
      let packageName = key.split('.').slice(0, -1).join('.');
      let packageLocal = this.rpc.packages[packageName];
      if (!packageLocal) {
        packageLocal = new Package(packageName);
        this.rpc.packages[packageName] = packageLocal;
      }
      let serviceName = key.split('.').slice(-1).join('');
      if ('format' in value) {
        let message = new Message(serviceName);
        message.execute = value;
        packageLocal.services[serviceName] = message;
      } else {
        let service = new Service(serviceName);
        service.execute = value;
        // 读取方法
        for (const methodKey of Object.keys(value)) {
          let method = new Method(methodKey);
          method.execute = value[methodKey];
          service.methods[methodKey] = method;
        }
        packageLocal.services[serviceName] = service;
      }
    }
    for (const item in this.grpcResult) {
      console.log('item = ' + item);
    }
  }
}

module.exports = ProtoParser;

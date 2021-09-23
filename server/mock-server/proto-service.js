'use strict';

const {makeClientConstructor} = require('@grpc/grpc-js');
const Const = require('./proto-const');

class Rpc {

  constructor(filepath) {
    this.filepath = filepath;
    this.packages = {};
  }

  getRpcService(packageName, serviceName, methodName) {
    try {
      let method = this.packages[packageName].services[serviceName].methods[methodName];
      let client = makeClientConstructor({[method.name]: method.execute}, serviceName, {});
      return client.service;
    } catch (e) {
      console.log('getRpcService error = ', e);
    }
    return null;
  }

  get packageNames() {
    return Object.keys(this.packages)
  }

  toObject() {
    let obj = {};
    obj.packages = [];
    for(const packageLocal of Object.values(this.packages)) {
      let packageObj = {};
      packageObj.name = packageLocal.name;
      packageObj.services = [];
      packageObj.messages = [];
      for(const service of Object.values(packageLocal.services)) {
        if (service instanceof Service) {
          let serviceObj = {};
          serviceObj.name = service.name;
          serviceObj.methods = [];
          for(const method of Object.values(service.methods)) {
            let methodObj = {};
            methodObj.name = method.name;
            methodObj.response = method.response;
            methodObj.requestName = method.requestName;
            methodObj.responseName = method.responseName;
            serviceObj.methods.push(methodObj)
          }
          packageObj.services.push(serviceObj);
        }
      }
      for(const messageName of packageLocal.messageNames) {
        let messageObj = {};
        messageObj.name = messageName;
        packageObj.messages.push(messageName);
      }
      obj.packages.push(packageObj);
    }
    return obj;
  }
}

class Package {
  constructor(name) {
    this.name = name;
    // 区分 service  和 message
    this.services = {};
  }

  get serviceNames() {
    let serviceNames = [];
    for(const service of Object.values(this.services)) {
      if (service instanceof Service) {
        serviceNames.push(service.name)
      }
    }
    return serviceNames;
  }

  get messageNames() {
    let messageNames = [];
    for(const service of Object.values(this.services)) {
      if (service instanceof Message) {
        messageNames.push(service.name)
      }
    }
    return messageNames;
  }

}

// rpc 服务
class Service {
  constructor(name) {
    this.name = name;
    this.methods = {};
    this.execute = null;
  }

  get methodNames() {
    let methodNames = [];
    for(const method of Object.values(this.methods)) {
      methodNames.push(method.name)
    }
    return methodNames;
  }

}

// 服务中的方法
class Method {
  constructor(name) {
    this.name = name;
    this.execute = null;
  }

  get requestName() {
    if (!this.execute) {
      return '';
    }
    return this.execute.requestType.type.name;
  }

  get responseName() {
    if (!this.execute) {
      return '';
    }
    return this.execute.responseType.type.name;
  }

  get response() {
    let resultObj = {};
    if (this.execute != null) {
      for (const fieldObj of this.execute.responseType.type.field) {
        let fieldName = fieldObj.name;
        switch (fieldObj.type) {
          case Const.Field.TYPE_DOUBLE:
          case Const.Field.TYPE_FLOAT:
            resultObj[fieldName] = 1.0;
            break;
          case Const.Field.TYPE_INT64:
          case Const.Field.TYPE_UINT64:
          case Const.Field.TYPE_UINT32:
          case Const.Field.TYPE_INT32:
          case Const.Field.TYPE_FIXED64:
          case Const.Field.TYPE_FIXED32:
          case Const.Field.TYPE_SFIXED32:
          case Const.Field.TYPE_SFIXED64:
          case Const.Field.TYPE_SINT32:
          case Const.Field.TYPE_SINT64:
          case Const.Field.TYPE_ENUM:
            resultObj[fieldName] = 1;
            break;
          case Const.Field.TYPE_BOOL:
            resultObj[fieldName] = true;
            break;
          case Const.Field.TYPE_STRING:
            resultObj[fieldName] = "1";
            break;
          case Const.Field.TYPE_BYTES:
            resultObj[fieldName] = new Uint8Array([1,2]);
            break;
          case Const.Field.TYPE_GROUP:
            resultObj[fieldName] = {"group": "group"};
            break;
          case Const.Field.TYPE_MESSAGE:
            resultObj[fieldName] = {"message": "message"};
            break;
        }
      }
    }
    return resultObj;
  }
}

// 服务中的消息
class Message {
  constructor(name) {
    this.name = name;
    this.execute = null;
  }
}


module.exports = {Rpc, Package, Service, Method, Message};

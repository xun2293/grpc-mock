'use strict';

const {Server} = require('@grpc/grpc-js');
const grpc = require('@grpc/grpc-js');

class MockServer extends Server {

  constructor(options = null) {
    super(options);
    this.isStart = false;
    this.services = {};
  }

  addService(id, rpcService, method, response) {
    if (this.services[id]) {
      return true;
    }
    if (typeof response !== 'object') {
      return false;
    }
    this.services[id] = rpcService;
    if (rpcService != null) {
      let methodCallback = function(call, callback) {
        callback(null, response);
      };
      try {
        super.addService(rpcService, {[method]: methodCallback});
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  removeService(id) {
    const service = this.services[id];
    if (service) {
      super.removeService(service);
      delete this.services[id];
    }
  }

  // start() {
  //   super.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
  //     super.start();
  //   });
  // }

  async startAsync() {
    if (this.isStart) {
      return new Promise((resolve) => {
        return resolve(null);
      });
    }
    return new Promise((resolve, reject) => {
      super.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (error) => {
        if (error) {
          return reject(error);
        } else {
          try {
            super.start();
          } catch (e) {
            return reject(e);
          }
        }
        this.isStart = true;
        return resolve('ok');
      });
    });
  }

  stop() {
    this.isStart = false;
    super.forceShutdown();
    this.services = {};
  }

}


module.exports = MockServer;

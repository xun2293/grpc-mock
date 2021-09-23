<template>
    <el-container>
        <el-header align="right">
            <el-button v-if="isMockMode()" type="success" @click="saveOneMock()">保存</el-button>
        </el-header>

        <el-main>
            <el-select v-model="selectProtocol" filterable placeholder="协议" @change="chooseProtocol" >
                <el-option
                        v-for="protocol in protocols"
                        :key="protocol"
                        :value="protocol">
                </el-option>
            </el-select>

            <el-select v-model="selectPackage" filterable placeholder="包名" @change="choosePackage" value-key="name">
                <el-option
                        v-for="packageLocal in packages"
                        :key="packageLocal.name"
                        :label="packageLocal.name"
                        :value="packageLocal">
                </el-option>
            </el-select>

            <el-select v-model="selectService" filterable placeholder="服务名" @change="chooseService" value-key="name">
                <el-option
                        v-for="service in services"
                        :key="service.name"
                        :label="service.name"
                        :value="service">
                </el-option>
            </el-select>

            <el-select v-model="selectMethod" filterable placeholder="方法名" @change="chooseMethod" value-key="name">
                <el-option
                        v-for="method in methods"
                        :key="method.name"
                        :label="method.name"
                        :value="method">
                </el-option>
            </el-select>
            <slot name="add" :selectProtocol="selectProtocol"></slot>
            <JSONEditorWrapper
                    v-if="messageJson != null && isMockMode()"
                    v-model="messageJson"
                    :editable="false"
                    :plus="false"
                    :height="'400px'"
                    @error="onError" @input="onInput" style="z-index: 0;"/>
            <template v-if="isCodeMode()">
                <el-input
                        v-if="textarea1"
                        type="textarea"
                        :rows="5"
                        v-model="textarea1">
                </el-input>
                <el-input
                        v-if="textarea2"
                        type="textarea"
                        :rows="3"
                        v-model="textarea2">
                </el-input>
                <el-input
                        v-if="textarea3"
                        type="textarea"
                        :rows="20"
                        v-model="textarea3">
                </el-input>

            </template>


        </el-main>
    </el-container>
</template>

<script>
  import JSONEditorWrapper from './JSONEditorWrapper.vue'

  export default {
    name: 'Proto',
    props: {
      mode: {
        type: Number,
        required: true
      },
    },
    components: {
      JSONEditorWrapper
    },
    data() {
      return {
        protocols: [],
        services: [],
        methods: [],
        packages: [],
        selectProtocol: '',
        selectPackage: '',
        selectService: '',
        selectMethod: '',
        methodShow: '',
        messageJson: null,
        methodReqName: '',
        methodRspName: '',
        jsonError : false,
        source: 1,// 文件上传
        textarea1: '',
        textarea2: '',
        textarea3: ''
      }
    },
    methods: {
      isMockMode() {
        return this.mode === 1;
      },
      isCodeMode() {
        return this.mode === 2;
      },
      getProtocol() {
        this.$axios.get('getProtocol')
          .then(rsp => {
            if (rsp.data.code === 0) {
              rsp.data.data.forEach(item => {
                this.protocols.push(item);
              });
            }
          })
          .catch(error => {
            // handle error
            console.log(error);
          })
          .finally(function () {
            // always executed
          });
      },
      getServiceAndName() {
        this.$axios.get('getServiceAndName', {
          params: {
            protocol: this.selectProtocol
          }
        })
          .then(rsp => {
            let data = rsp.data;
            if (data.code === 0) {
              for (const packageLocal of data.data.packages) {
                this.packages.push(packageLocal);
              }
              if (this.packages.length === 1) {
                this.choosePackage(this.packages[0]);
              }
            } else {
              this.showMessage(data);
            }
          })
          .catch(error => {
            // handle error
            console.log(error);
          })
          .finally(function () {
            // always executed
          });
      },

      chooseProtocol(protocol) {
        this.clearPackage();
        this.selectProtocol = protocol;
        this.getServiceAndName();
      },
      choosePackage(packageLocal) {
        this.clearService();
        this.selectPackage = packageLocal.name;
        this.services = [...packageLocal.services];
        if (this.services.length === 1) {
          this.chooseService(this.services[0]);
        }
      },
      chooseService(service) {
        this.clearMethod();
        this.selectService = service.name;
        this.methods = [...service.methods];
      },
      chooseMethod(method) {
        this.selectMethod = method.name;
        this.messageJson = method.response;
        this.methodReqName = method.requestName;
        this.methodRspName = method.responseName;
      },
      clearPackage() {
        this.clearService();
        this.selectPackage = '';
        this.packages.length = 0;
      },
      clearService() {
        this.clearMethod();
        this.selectService = '';
        this.services.length = 0;
      },
      clearMethod() {
        this.selectMethod = '';
        this.methods.length = 0;
        this.messageJson = null;
        this.methodReqName = '';
        this.methodRspName = '';
      },
      saveOneMock() {
        if (this.selectProtocol === '' || this.selectPackage === '' || this.selectService === '' || this.selectMethod === '') {
          this.showError('请选择完整');
          return;
        }
        if (this.jsonError) {
          this.showError('json错误');
          return;
        }
        this.$axios.post('add', {
          // 第一个是业务id
          'protocol': this.selectProtocol,
          'packageName': this.selectPackage,
          'service': this.selectService,
          'method': this.selectMethod,
          'message': this.messageJson,
          'source': this.source
        })
          .then(rsp => {
            let data = rsp.data;
            this.showMessage(data);
          })
          .catch(error => {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      startServer() {
        this.$axios.post('startServer')
          .then(rsp => {
            let data = rsp.data;
            this.showMessage(data);
          })
          .catch(error => {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      stopServer() {
        this.$axios.post('stopServer')
          .then(rsp => {
            let data = rsp.data;
            this.showMessage(data);
          })
          .catch(error => {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      genCode() {
        // TODO: 暂时屏蔽此功能，目标是转为自定义代码模板
        this.textarea1 = 'model1';
        this.textarea2 = 'model2';
        this.textarea3 = 'model3';
      },
      clearCode() {
        this.textarea1 = '';
        this.textarea2 = '';
        this.textarea3 = '';
      },
      onError() {
        this.jsonError = true;
      },
      onInput(json) {
        this.jsonError = false;
      },
    },
    mounted() {
      this.getProtocol();
    },
    watch: {
      selectMethod: {
        handler(newValue, oldValue) {
          if (newValue === '') {
            this.clearCode();
          } else {
            if (newValue.length > 1) {
              this.methodShow = newValue.substring(0, 1).toLocaleLowerCase() + newValue.substring(1);
            } else {
              this.methodShow = newValue.substring(0, 1).toLocaleLowerCase();
            }
            this.genCode();
          }
        },
        deep: true
      }
    },
  }
</script>

<style scoped>

</style>

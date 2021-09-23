<template>
    <div id="wrapper2">
        <!-- 输入管理端配置 -->
        Mock服务器状态
        <el-tag type="success" v-if="serverStatus">开启</el-tag>
        <el-tag type="danger" v-else>关闭</el-tag>

        <el-button type="success" style="margin-left: 15px;" @click="startServer()">开启</el-button>
        <el-button type="success" style="margin-left: 15px;" @click="stopServer()">关闭</el-button>
        <template v-if="serverStatus">
            {{ mockServerUrl }}
        </template>

        <el-table
                :data="mockList"
                stripe
                border
                style="width: 100%;margin-top: 30px;">
<!--            <el-table-column-->
<!--                    prop="id"-->
<!--                    label="id">-->
<!--            </el-table-column>-->
            <el-table-column
                    prop="username"
                    label="所有者">
            </el-table-column>
            <el-table-column
                    prop="protocol"
                    label="协议">
            </el-table-column>
            <el-table-column
                    prop="packageName"
                    label="包名">
            </el-table-column>
            <el-table-column
                    prop="service"
                    label="服务名">
            </el-table-column>
            <el-table-column
                    prop="method"
                    label="方法名">
            </el-table-column>
            <el-table-column
                    label="回包">
                <template slot-scope="scope">{{ JSON.stringify(scope.row.message) }}</template>
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作"
                    width="200">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.isEnable" @click="handleEnable(scope.row, false)" type="success" size="small">启用中</el-button>
                    <el-button v-else @click="handleEnable(scope.row, true)" type="danger" size="small">未启用</el-button>
                    <el-button @click="handleShow(scope.row)" type="text" size="small">编辑</el-button>
                    <el-button @click="deleteConfirm(scope.row)" type="text" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog title="message change" :visible.sync="dialogVisible">
            <JSONEditorWrapper
                    v-if="updateMessageJson != null"
                    v-model="updateMessageJson"
                    :editable="true"
                    :plus="false"
                    :height="'400px'"
                    @error="onError" @input="onInput" style="z-index: 0;"/>
            <div slot="footer" class="dialog-footer">
                <el-button @click="updateCancel()">取 消</el-button>
                <el-button type="primary" @click="updateSave()">保 存</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
  import JSONEditorWrapper from './JSONEditorWrapper.vue'

  export default {
    name: 'Home',
    components: {
      JSONEditorWrapper
    },
    data() {
      return {
        serverStatus: false,
        mockList: [],
        dialogVisible: false,
        updateMessageJson: null,
        updateRow: null,
        jsonError: false,
        mockServerUrl: process.env.VUE_APP_MOCK_SERVER_URL
      }
    },
    methods: {
      getList() {
        this.$axios.get('list')
          .then(rsp => {
            let data = rsp.data;
            if (data.code === 0) {
              this.mockList = [...data.data];
            }
          })
          .catch(error => {
            // handle error
            console.log(error);
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
            if (data.code === 0) {
              this.serverStatus = true;
            }
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
            if (data.code === 0) {
              this.serverStatus = false;
            }
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
      getStatus() {
        this.$axios.get('getStatus')
          .then(rsp => {
            let data = rsp.data;
            this.serverStatus = data.data.status;
          })
          .catch(error => {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      handleShow(row) {
        this.dialogVisible = true;
        this.updateMessageJson = row.message;
        this.updateRow = row;
      },
      updateCancel() {
        this.dialogVisible = false;
      },
      updateSave() {
        if (this.jsonError) {
          this.$message.error('json错误');
        } else {
          this.handleUpdate(this.updateRow, this.updateMessageJson);
        }
      },
      deleteConfirm(row) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleDelete(row);
        }).catch(() => {
          // do nothing
        });
      },
      handleDelete(row) {
        this.$axios.post('delete', {
          // 第一个是业务id
          'id': row.id
        })
          .then(rsp => {
            let data = rsp.data;
            if (data.code === 0) {
              this.mockList.splice(this.mockList.findIndex(v => v.id === row.id), 1)
            }
            this.showMessage(data);
          })
          .catch(function (error) {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      handleEnable(row, isEnable) {
        this.$axios.post('enable', {
          // 第一个是业务id
          'id': row.id,
          'isEnable': isEnable
        })
          .then(rsp => {
            let data = rsp.data;
            if (data.code === 0) {
              row.isEnable = isEnable;
            }
            this.showMessage(data);
          })
          .catch(function (error) {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      handleUpdate(row, messageJson) {
        this.$axios.post('update', {
          // 第一个是业务id
          'id': row.id,
          'message': messageJson
        })
          .then(rsp => {
            let data = rsp.data;
            if (data.code === 0) {
              this.dialogVisible = false;
              row.message = messageJson;
            }
            this.showMessage(data);
          })
          .catch(function (error) {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      onError() {
        this.jsonError = true;
      },
      onInput(json) {
        this.jsonError = false;
      },
    },
    mounted() {
      this.getList();
      this.getStatus();
    },
    watch: {

    },
  }
</script>

<style scoped>
    #wrapper {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
    .right-top-border {
        border: 1px none lightgrey;
        border-right-style: solid;
        border-top-style: solid;
    }
    .top-border {
        border: 1px none lightgrey;
        border-top-style: solid;
    }
</style>

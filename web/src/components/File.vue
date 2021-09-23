<template>
    <div style="width: 100%;">
        <div style="text-align:center;margin: auto;">
            <span>当前上传目录：{{currentPath}}</span>
        </div>
        <el-upload
                class="upload-demo"
                style="margin: 0 auto; text-align:center;"
                :data="{chooseDir: currentPath}"
                drag
                :before-upload="beforeFileUpload"
                :action="uploadUrl"
                :on-success="handleUploadSuccess"
                :headers="getAuth()"
                multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">only support .proto or .zip</div>
        </el-upload>

        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12" style="box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)">
                <el-tree
                        :data="fileTree"
                        :props="defaultProps"
                        ref="tree"
                        highlight-current
                        default-expand-all
                        :expand-on-click-node="false"
                        @node-click="handleNodeClick">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span>{{ node.label }}</span>
                    <span>
                        <el-button
                                type="text"
                                size="mini"
                                @click="() => openInput(data)">
                            添加目录
                        </el-button>

                        <el-button
                                v-if="data.name !== '/'"
                                type="text"
                                size="mini"
                                @click="() => deleteConfirm(node, data)">
                            删除目录
                        </el-button>
                        <el-button
                                v-else
                                type="text"
                                size="mini"
                                @click="() => deleteConfirm(node, data)">
                            清空文件（不含目录）
                        </el-button>
                    </span>
                </span>
                </el-tree>
            </el-col>

            <el-col :span="12">
                <el-table
                        :data="fileList"
                        stripe
                        border
                        style="width: 100%;">
                    <el-table-column
                            label="文件名">
                        <template slot-scope="scope">
                            <span>{{ fileList[scope.$index] }}</span>
                        </template>
                    </el-table-column>
                    <!--                    <el-table-column-->
                    <!--                            fixed="right"-->
                    <!--                            label="操作"-->
                    <!--                            width="100">-->
                    <!--                        <template slot-scope="scope">-->
                    <!--                            <el-button @click="handleShow(scope.row)" type="text" size="small">查看</el-button>-->
                    <!--                            <el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>-->
                    <!--                        </template>-->
                    <!--                    </el-table-column>-->
                </el-table>

            </el-col>
        </el-row>
    </div>
</template>

<script>

  import modules from "../store/modules";

  export default {
    name: 'File',
    components: {
    },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_SERVER_URL + 'upload',
        source: 1,// 文件上传
        fileTree: [],
        defaultProps: {
          children: 'childs',
          label: 'name'
        },
        fileList: [],
        currentPath: '/'
      }
    },
    methods: {
      getFileTree() {
        this.$axios.get('getFileTree')
          .then(rsp => {
            if (rsp.data.code === 0) {
              this.fileTree = rsp.data.data;
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
      deletePath(treePath) {
        this.$axios.post('deletePath', {
          'path': treePath
        })
          .then(rsp => {
            let data = rsp.data;
            this.showMessage(data);
            if (treePath === '/' && this.currentPath === '/' && data.code === 0) {
              this.fileList = [];
            }
          })
          .catch(error => {
            // handle error
            this.showError(error);
          })
          .finally(function () {
            // always executed
          });
      },
      beforeFileUpload(file) {
        let fileExt = file.name.split('.').pop();
        if (fileExt !== 'proto' && fileExt !== 'zip') {
          this.$message.error('only support .proto or .zip');
          return false;
        }
        return true;
      },
      handleUploadSuccess(response, file, fileList) {
        this.getFileTree();
      },
      handleNodeClick(data) {
        this.fileList = data.files;
        this.currentPath = data.path;
      },
      openInput(data) {
        this.$prompt('请输入路径', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[a-z]*?$/,
          inputErrorMessage: '格式不正确'
        }).then(({ value }) => {
          this.append(data, value)
        }).catch(() => {

        });
      },
      deleteConfirm(node, data) {
        this.$confirm('此操作将删除服务器上的文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.remove(node, data);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      append(data, name) {
        let newChild = {
          name: name,
          childs: [],
          files: [],
          path: data.path === '/' ? '/' + name : data.path + '/' + name
        };
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.childs.push(newChild);
      },
      remove(node, data) {
        if (data.path === '/') {
          this.handleNodeClick(data);
          this.deletePath(data.path);
        } else {
          const parent = node.parent;
          const childs = parent.data.childs || parent.data;
          const index = childs.findIndex(d => d.name === data.name);
          let child = childs.splice(index, 1);
          let dpath = child[0].path;
          this.handleNodeClick(parent.data);
          this.deletePath(dpath);
        }
      },
      getAuth() {
        return {Authorization: `Bearer ${modules.user.state.token}`};
      }
    },
    mounted() {
      this.getFileTree();
    },
    watch: {

    },
  }
</script>

<style scoped>
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }
</style>

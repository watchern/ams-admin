<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <el-row>
      <el-col align="right">
        <!-- 上传文件 -->
        <el-button type="primary" class="oper-btn add-folder" title="上传文件" @click="handUploadFile()" />
        <!-- 添加文件夹 -->
        <el-button type="primary" class="oper-btn folder" title="上传文件夹" :disabled="createDirStatus" @click="handleCreateDir()" />
        <!-- 删除 -->
        <el-button type="primary" class="oper-btn delete" title="删除文件" :disabled="selections.length === 0" @click="handleDelete()" />
        <!-- 移动 -->
        <el-button type="primary" class="oper-btn share" title="文件移动" :disabled="createFileDirStatus" @click="handleMove()" />
      </el-col>

    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      stripe
      fit
      style="width: 100%;"
      :data="list"
      border
      highlight-current-row
      max-height="800"
      lazy
      row-key="path"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
      />
      <el-table-column
        label="目录名称"
        align="center"
        prop="name"
      />
      <el-table-column
        label="路径"
        align="center"
        prop="path"
      />
      <el-table-column
        label="文件大小"
        align="center"
        prop="sizeString"
      />
    </el-table>
    <!-- 创建文件夹 -->
    <el-dialog
      title="创建文件夹"
      :visible.sync="creatDirdialogFormVisible"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="dataForm"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="目录名称"
          prop="dirName"
        >
          <el-input
            v-model="dirName"
            placeholder="请输入目录名称"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="creatDirdialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="createFileDir()"
        >确定</el-button>
      </div>
    </el-dialog>

    <!-- 移动文件 -->
    <el-dialog
      title="移动文件"
      :visible.sync="moveFileVisible"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="treeFrom"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="选择目标位置"
        >
          <!--          lazy-->
          <el-tree
            ref="treeFrom"
            :data="dirList"
            :props="{label: 'path', children: 'children' }"
            default-expand-all
            node-key="id"
            show-checkbox
            check-strictly
            class="treeStyle"
            @check-change="handleCheckChange"
          />
        </el-form-item>
        <!--        <el-form-item-->
        <!--          label="目录名称"-->
        <!--          prop="newDirName"-->
        <!--        >-->
        <!--          <el-input-->
        <!--            v-model="newDirName"-->
        <!--            placeholder="data.path"-->
        <!--          />-->
        <!--        </el-form-item>-->
      </el-form>
      <div slot="footer">
        <el-button @click="moveFileVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="moveFileDir()"
        >确定</el-button>
      </div>
    </el-dialog>
    <!--    上传文件-->
    <el-dialog
      title="上传文件"
      :visible.sync="uploadFileVisible"
    >
      <!-- label-width="140px" -->
      <el-form
        ref="treeFrom"
        label-position="right"
        class="detail-form"
      >
        <el-form-item
          label="选择目标位置"
        >
          <!--          lazy-->
          <el-tree
            ref="treeFrom"
            :data="dirList"
            :props="{label: 'path', children: 'children' }"
            default-expand-all
            node-key="id"
            show-checkbox
            check-strictly
            class="treeStyle"
            @check-change="handleCheckChange"
          />
        </el-form-item>
      </el-form>
      <div>
        <uploader
          :key="uploader_key"
          :options="options"
          class="uploader-example"
          :auto-start="false"
          @file-success="onFileSuccess"
          @file-added="filesAdded"
          @file-progress="onFileProgress"
          @file-error="onFileError"
        >
          <uploader-unsupport />
          <uploader-drop>
            <uploader-btn :attrs="attrs">选择文件或者拖拽文件至此处</uploader-btn>
          </uploader-drop>
          <uploader-list />
        </uploader>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBylist, createDir, deleteFile, moveFile, getDirTree } from '@/api/etlscheduler/filemanager'
import QueryField from '@/components/Ace/query-field/index'
import SparkMD5 from 'spark-md5'

export default {
  components: { QueryField },
  data() {
    return {
      dirList: null,
      tableKey: 'fileDirectoryUuid',
      list: null,
      total: 0,
      listLoading: false,
      queryFields: [
        {
          label: '目录类型', name: 'directoryType', type: 'select',
          data: [{ name: '存储目录', value: '1' }, { name: '执行目录', value: '2' },
            { name: '备份目录', value: '3' }, { name: '异常目录', value: '4' }, { name: '手动备份目录', value: '5' }],
          default: '1'
        }
      ],
      pageQuery: {},
      props: {
        label: 'name',
        children: 'zones'
      },
      count: 1,
      temp: {
        directoryType: null,
        directoryPath: null,
        name: null
      },
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      // 添加的表单验证
      rules: {
        paramName: [{ required: true, message: '请填写文件名称', trigger: 'change' }],
        paramType: [{ required: true, message: '请选择文件的类型', trigger: 'change' }],
        status: [{ required: true, message: '请填写文件的路径', trigger: 'change' }]
      },
      rulesCreat: {
        dirName: [{ required: true, message: '请填写文件目录名称', trigger: 'change' }],
        newDirName: [{ required: true, message: '请填写文件目录名称', trigger: 'change' }]
      },
      // chunkSize: 10 * 1024 * 1024,
      uploader_key: new Date().getTime(),
      options: {
        target: '/etlscheduler/chunk/chunkUpload',
        testChunks: false,
        query: { path: '' }
      },
      // TODO
      attrs: {
        accept: '.txt'
      },
      downloadLoading: false,
      creatDirdialogFormVisible: false,
      moveFileVisible: false,
      uploadFileVisible: false,
      createDirStatus: true,
      createFileDirStatus: true,
      dirName: null,
      newDirName: null,
      moveDirPath: null
    }
  },
  watch: {
    selections() {
      // 选择1条数据
      if (this.selections.length === 1) {
        // 如果是文件夹的话，创建文件夹可用
        if (this.selections[0].ifDir) {
          this.createDirStatus = false
          this.createFileDirStatus = true
        } else {
          this.createFileDirStatus = false
        }
      } else {
        this.createDirStatus = true
        this.createFileDirStatus = true
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) this.pageQuery = query
      getBylist(this.pageQuery).then(resp => {
        this.list = resp.data
        this.listLoading = false
      })
    },
    handleCheckChange(data, checked, indeterminate) {
      // console.log(data, checked, indeterminate)
      this.moveDirPath = data.path
      this.options.query.path = data.path
    },
    handleNodeClick(data, checked, node) {
      // console.log('多选框设为单选框', checked, data)
      if (checked) {
        this.$refs.treeForm.setCheckedKeys([data.id])
      }
    },
    menuCheck(data, lst) {
      if (lst.checkedKeys.length === 0) {
        this.$refs.treeForm.setCheckedKeys([data.id])
      }
    },
    loadNode(node, resolve) {
      // if (node.level === 0) {
      //   return resolve([{ name: 'region1' }, { name: 'region2' }])
      // }
      // if (node.level > 3) return resolve([])
      //
      // var hasChild
      // if (node.data.name === 'region1') {
      //   hasChild = true
      // } else if (node.data.name === 'region2') {
      //   hasChild = false
      // } else {
      //   hasChild = Math.random() > 0.5
      // }
      //
      // setTimeout(() => {
      //   var data
      //   if (hasChild) {
      //     data = [{
      //       name: 'zone' + this.count++
      //     }, {
      //       name: 'zone' + this.count++
      //     }]
      //   } else {
      //     data = []
      //   }
      //
      //   resolve(data)
      // }, 500)
    },
    createFileDir() {
      createDir({ name: this.dirName, path: this.selections[0].path }).then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: this.$t('message.insert.success'),
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
      this.dirName = null
      this.creatDirdialogFormVisible = false
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        status: null
      }
    },
    handleCreateDir() {
      this.resetTemp()
      this.creatDirdialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete() {
      var path = []
      this.selections.forEach((r, i) => {
        path.push(r.path)
      })
      deleteFile({ path: path.join(',') }).then((res) => {
        this.getList()
        if (res.code === 0) {
          this.$notify({
            title: this.$t('message.title'),
            message: this.$t('message.delete.success'),
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        } else {
          this.$message.error(this.$t(res.msg))
        }
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    // 文件移动
    handleMove() {
      this.resetTemp()
      this.moveFileVisible = true
      getDirTree().then((resp) => {
        this.dirList = resp.data
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    moveFileDir() {
      const a = { oldFileName: this.selections[0].path, newFileName: this.moveDirPath }
      moveFile({ param: JSON.stringify(a) }).then(() => {
        this.getList()
        this.$notify({
          title: this.$t('message.title'),
          message: '文件移动成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
      this.newDirName = null
      this.moveFileVisible = false
    },
    // 上传文件
    handUploadFile() {
      this.resetTemp()
      this.uploadFileVisible = true
      getDirTree().then((resp) => {
        this.dirList = resp.data
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    onFileSuccess: function(rootFile, file, response, chunk) {
      if (JSON.parse(response).code !== 0) {
        this.$message.error(this.$t(JSON.parse(response).msg))
        file.cancel()
      } else {
        this.$notify({
          title: this.$t('message.title'),
          message: this.$t(JSON.parse(response).data + '上传成功'),
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
        this.getList()
      }
    },
    onFileProgress(rootFile, file, chunk) {
      console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
    },
    onFileError(rootFile, file, response, chunk) {
      this.$message.error(this.$t(JSON.parse(response).msg))
      file.error()
    },
    computeMD5(file) {
      const loading = this.$loading({
        lock: true,
        text: '正在计算MD5',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const fileReader = new FileReader()
      const time = new Date().getTime()
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let currentChunk = 0
      // const chunkSize = this.chunkSize
      const chunkSize = 10 * 1024 * 1024
      const chunks = Math.ceil(file.size / chunkSize)
      const spark = new SparkMD5.ArrayBuffer()
      file.pause()

      loadNext()

      fileReader.onload = e => {
        spark.append(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
          this.$nextTick(() => {
            console.log('校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%')
          })
        } else {
          const md5 = spark.end()
          loading.close()
          this.computeMD5Success(md5, file)
          console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`)
        }
      }
      fileReader.onerror = function() {
        this.error(`文件${file.name}读取出错，请检查该文件`)
        loading.close()
        file.cancel()
      }

      function loadNext() {
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },
    computeMD5Success(md5, file) {
      file.uniqueIdentifier = md5// 把md5值作为文件的识别码
      file.resume()// 开始上传
    },
    filesAdded(file, event) {
      // 大小判断
      // const isLt100M = file.size / 1024 / 1024 < 10
      const isLt100M = true
      if (!isLt100M) {
        this.$message.error(this.$t('error.error_upload_file_max'))
      } else {
        this.computeMD5(file)
      }
    }
  }
}
</script>
<style>
  .uploader-example {
    /* width: 90%; */
    /* padding: 15px; */
    /* margin: 40px auto 0; */
    /* font-size: 12px; */
    /* box-shadow: 0 0 10px rgba(0, 0, 0, .4); */
  }

  .uploader-btn {
    /* margin-right: 4px; */
    /* display: inline-block;
    position: relative;
    padding: 4px 8px;
    font-size: 100%;
    line-height: 1.4;
    color: #666;
    border: 1px solid #666;
    cursor: pointer;
    border-radius: 2px;
    outline: none; */
  }

  .uploader-example .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>

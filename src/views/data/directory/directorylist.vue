<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getListSelect"
      />
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" :disabled="selections.length === 0" title="删除" class="oper-btn delete" @click="delData" />
        <el-button type="primary" class="oper-btn copy" :disabled="selections.length !== 1" title="复制" @click="copyResource" />
        <el-button type="primary" class="oper-btn move" title="移动" :disabled="selections.length === 0" @click="movePath" />
        <el-button type="primary" class="oper-btn rename" title="重命名" :disabled="selections.length !== 1" @click="renameResource" />
        <el-button type="primary" class="oper-btn add" title="新增表" :disabled="clickData.type == 'table'" @click="add" />
        <el-button type="primary" class="oper-btn export" title="导入表" :disabled="clickData.type == 'table'" @click="uploadTable" />
        <el-button type="primary" class="oper-btn add-folder" title="新增文件夹" :disabled="clickData.type == 'table'" @click="createFolder" />
        <el-button type="primary" class="oper-btn  edit" title="表结构维护" :disabled="selections.length !== 1" @click="update" />
        <el-button type="primary" class="oper-btn  detail" title="表结构展示" :disabled="selections.length !== 1" @click="showTable" />
        <el-button type="primary" class="oper-btn search" title="预览" :disabled="infoFlag" @click="preview" />
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="temp"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="名称" prop="label" />
      <el-table-column label="资源类型" :formatter="formatTableType" prop="type" />
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template slot-scope="scope">{{ formatCreateTime(scope.row.extMap.createTime) }}</template>
      </el-table-column>
      <el-table-column prop="tbSizeByte" label="大小" align="center">
        <template slot-scope="scope">{{ formatTableSize(scope.row.extMap.tbSizeByte) }}</template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getListSelect" />
    <!-- 弹窗 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="folderFormVisible" width="600px">
      <el-form ref="folderForm" :model="resourceForm" label-width="80px">
        <el-form-item :label="typeLabel" label-width="120px">
          <el-input v-model="resourceForm.resourceName" style="width: 300px" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="folderFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus==='copyTable'" type="primary" @click="copyResourceSave()">保存</el-button>
        <el-button v-if="dialogStatus==='createFolder'" type="primary" @click="createFolderSave()">保存</el-button>
        <el-button v-if="dialogStatus==='updateFolder'||dialogStatus==='updateTable'" type="primary" @click="renameResourceSave()">保存</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗2 -->
    <el-dialog :visible.sync="moveTreeVisible" width="600px">
      <dataTree v-if="personcode!==''" ref="dataTree" :data-user-id="personcode" :scene-code="sceneCode" :tree-type="treeType" @node-click="nodeclick" />
      <span slot="footer">
        <el-button @click="moveTreeVisible = false">取消</el-button>
        <el-button type="primary" @click="movePathSave()">保存</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗3 -->
    <el-dialog v-if="uploadVisible" :visible.sync="uploadVisible" width="800px">
      <el-row>
        <el-col>
          <directory-file-upload v-if="uploadStep === 1" @fileuploadname="fileuploadname" />
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form
            v-if="uploadStep === 1"
            ref="dataForm"
            :rules="uploadRules"
            :model="uploadtemp"
            label-position="right"
            style="width: 750px;"
          >
            <el-form-item label="导入表名称：(若导入数据为TXT数据需用','分割,列信息用换行即可)" prop="tbName">
              <el-input v-model="uploadtemp.tbName" label="请输入表名称" />
            </el-form-item>
            <el-form-item prop="tableFileName">
              <el-input v-model="uploadtemp.tableFileName" hidden disabled />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-table v-if="uploadStep === 2" :data="uploadtempInfo.colMetas" height="600px">
            <el-table-column prop="colName" label="字段名称" show-overflow-tooltip>
              <template slot-scope="scope" show-overflow-tooltip>
                <el-input v-model="scope.row.colName" style="width:90%;" />
              </template>
            </el-table-column>
            <el-table-column prop="dataType" label="数据类型">
              <template slot-scope="scope">
                <el-select ref="dataType" v-model="scope.row.dataType" filterable style="width:90%" placeholder="请选择数据类型">
                  <el-option
                    v-for="item in options"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="dataLength" label="数据长度" show-overflow-tooltip>
              <template slot-scope="scope" show-overflow-tooltip>
                <el-input v-model="scope.row.dataLength" style="width:90%;" />
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button v-if="uploadStep === 1" type="primary" @click="nextImport">下一步</el-button>
        <el-button v-if="uploadStep === 2" type="primary" @click="importTable">导入</el-button>
        <el-button type="primary" @click="uploadVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗4 -->
    <el-dialog v-if="tableShowVisible" :visible.sync="tableShowVisible" width="800px">
      <el-row>
        <el-col>
          <tabledatatabs ref="tabledatatabs" :table-id="tableId" :forder-id="clickData.id" :open-type="openType" :tab-show.sync="tabShow" />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button type="primary" @click="tableShowVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗5 -->
    <el-dialog v-if="previewVisible" :visible.sync="previewVisible" width="800px">
      <el-row>
        <el-col>
          <childTabs ref="childTabs" :pre-value="executeSQLList" use-type="previewTable" />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button type="primary" @click="previewVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import directoryFileUpload from '@/views/data/tableupload'
import { getSqlType } from '@/api/data/table-info'
import tabledatatabs from '@/views/data/table/tabledatatabs'
import childTabs from '@/views/analysis/auditmodelresult/childtabs'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import QueryField from '@/components/Ace/query-field/index'
import { getArrLength } from '@/utils'
import { deleteDirectory, copyTable, renameResource, movePath, preview, nextUpload, importTable } from '@/api/data/directory'
import { saveFolder } from '@/api/data/folder'
import dataTree from '@/views/data/role-res/data-tree'
import { mapState } from 'vuex'
export default {
  computed: {
    // 因为时序问题，store中没有personcode时组件可能被加载 导致dataUserId==''  所以要加personcode!=='' 控制
    // eslint-disable-next-line no-undef
    ...mapState({
      personcode: state => state.user.code
    })
  },
  // eslint-disable-next-line vue/order-in-components
  components: { Pagination, QueryField, dataTree, childTabs, tabledatatabs, directoryFileUpload },
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
      saveFlag: true,
      infoFlag: true,
      dataUserId: this.$store.getters.personcode,
      openType: '',
      // 移动树节点展示
      tableKey: 'id',
      sceneCode: 'auditor',
      treeType: 'save', // common:正常的权限树   save:用于保存数据的文件夹树
      tableId: '',
      typeLabel: '',
      list: null,
      executeSQLList: [],
      arrSql: {},
      data: null,
      node: null,
      tree: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '名称', name: 'label', type: 'text', value: '' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: [{
        id: '',
        label: '',
        type: '',
        extMap: {
          createTime: '',
          tbSizeByte: ''
        }
      }],
      folderForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null
      },
      clickData: { id: '', type: '' },
      clickNode: {},
      clickFullPath: [],
      allList: [],
      selections: [],
      // 要移动的数据集合
      moveSelect: [],
      resourceForm: {
        folderUuid: null,
        resourceName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null,
        extMap: {}
      },
      folderFormVisible: false,
      dialogStatus: '',
      tabShow: '',
      previewVisible: false,
      tableShowVisible: false,
      moveTreeVisible: false,
      uploadVisible: false,
      uploadtemp: {
        tbName: '',
        tableFileName: '',
        folderUuid: ''
      },
      uploadRules: {
        tbName: [{ required: true, message: '请填写导入表名称', trigger: 'change' }]
      },
      // 导入步骤
      uploadStep: 1,
      uploadtempInfo: [],
      options: [],
      textMap: {
        updateFolder: '重命名文件夹',
        updateTable: '重命名表',
        copyTable: '复制表',
        createFolder: '新建文件夹'
      },
      downloadLoading: false
    }
  },
  // computed: {
  //   dialogTitle() {
  //     return (this.selections[0].label == null ? '' : '在<' + this.selections[0].label + '>下') + this.textMap[this.dialogStatus]
  //   }
  // },
  created() {
    // this.getList(this.data, this.node, this.tree)this.$refs.childTabs.loadTableData(this.arrSql)
  },
  methods: {
    fileuploadname(data) {
      this.uploadtemp.tableFileName = data
    },
    formatTableType(row, column) {
      if (row.type === '') {
        return ''
      }
      return row.type === 'table' ? '数据表' : '文件夹'
    },
    // 删除资源
    delData() {
      var ids = []
      this.selections.forEach((r, i) => {
        if (r.type === 'folder') {
          if (r.extMap.folderType === 'virtual') {
            this.$message({ type: 'info', message: '该文件为系统文件夹不允许删除!' })
            return
          }
          var foldObj = this.allList.filter(obj => { return obj.label === r.label })
          var objTotal = getArrLength(foldObj[0].children)
          if (objTotal > 0) {
            this.$message({ type: 'info', message: '删除失败！文件夹：' + foldObj[0].label + '不为空无法删除' })
            return
          }
        }
        ids.push(r)
      })
      this.$confirm('确定删除该资源?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteDirectory(ids).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 5000,
            position: 'bottom-right'
          })
        })
      })
      this.$emit('remove', this.selections, this.clickNode)
    },
    // 复制资源(只允许复制数据表，不允许复制文件夹)
    copyResource() {
      if (this.selections[0].type === 'folder') {
        this.$message({ type: 'info', message: '所选资源为文件夹而非数据表!' })
        return
      } else {
        this.dialogStatus = 'copyTable'
        this.typeLabel = '复制表名称'
        this.resourceForm.resourceName = ''
        this.folderFormVisible = true
      }
    },
    // 填写复制表名称后点击保存
    copyResourceSave() {
      var tempData = Object.assign({}, this.selections[0])
      tempData.label = this.resourceForm.resourceName
      copyTable(tempData).then(res => {
        if (res.data) {
          this.$notify({
            title: '成功',
            message: '复制表成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.$emit('refresh')
        } else {
          this.$message({ type: 'info', message: '复制失败!复制表名称已由现有对象使用' })
        }
      })
      this.resourceForm.resourceName = ''
      this.folderFormVisible = false
    },
    // 执行下一步 读取文件列信息
    nextImport() {
      this.uploadtemp.folderUuid = this.clickData.id
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          nextUpload(this.uploadtemp).then(res => {
            getSqlType().then(resp => {
              this.options = resp.data
            })
            this.uploadStep = 2
            this.uploadtempInfo = res.data
          })
        }
      })
    },
    // 执行create后导入功能
    importTable() {
      importTable(this.uploadtempInfo).then(res => {
        this.uploadVisible = false
        if (res.data.resCode === true) {
          debugger
          console.log(res.data.importTable.tableMetaUuid)
          var childData = {
            id: res.data.importTable.tableMetaUuid,
            label: res.data.importTable.displayTbName,
            pid: res.data.importTable.folderUuid,
            type: 'table',
            extMap: {
              accessType: ['FETCH_TABLE_DATA', 'BASIC_PRIV'],
              createTime: res.data.importTable.createTime,
              tableName: res.data.importTable.tbName,
              tbSizeByte: 0,
              tblType: 'T'
            }
          }
          // 添加节点
          this.$emit('append-node', childData, this.clickNode)
          this.$notify({
            title: '成功',
            message: res.data.msg,
            type: 'success',
            duration: 5000,
            position: 'bottom-right'
          })
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg
          })
        }
      })
    },
    // 不允许重命名系统文件夹
    renameResource() {
      this.resourceForm.resourceName = ''
      if (this.selections[0].type === 'folder') {
        if (this.selections[0].extMap.folderType === 'virtual') {
          this.$message({ type: 'info', message: '重命名失败!该文件为系统文件夹不允许重命名' })
          return
        }
        this.dialogStatus = 'updateFolder'
        this.typeLabel = '重命名文件夹名称'
        this.folderFormVisible = true
      } else {
        this.dialogStatus = 'updateTable'
        this.typeLabel = '重命名数据表名称'
        this.folderFormVisible = true
      }
    },
    // 移动资源
    nodeclick(data, node, tree) {
      var pathArr = []
      var newNode = node.parent
      while (newNode.parent != null) {
        pathArr.push(newNode.data.label)
        if (newNode.parent != null) {
          newNode = newNode.parent
        }
      }
      // this.moveSelect = pathArr.reverse().join('/')
      this.moveSelect = data
    },
    movePath() {
      var moveObj = this.selections.filter(obj => { return obj.type === 'folder' })
      var objTotal = getArrLength(moveObj)
      if (objTotal > 0) {
        this.$message({ type: 'info', message: '移动失败!移动文件夹操作不允许' })
        return
      }
      this.moveTreeVisible = true
    },
    movePathSave() {
      var ids = []
      this.selections.forEach((r, i) => {
        r.pid = this.moveSelect.id
        ids.push(r)
      })
      movePath(ids).then(() => {
        this.moveTreeVisible = false
        this.$notify({
          title: '成功',
          message: '移动成功',
          type: 'success',
          duration: 5000,
          position: 'bottom-right'
        })
        this.$emit('refresh')
      })
    },
    // 重命名资源名称
    renameResourceSave() {
      var tempData = Object.assign({}, this.selections[0])
      tempData.label = this.resourceForm.resourceName
      renameResource(tempData).then(res => {
        if (res.data) {
          this.$notify({
            title: '成功',
            message: '重命名资源成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        } else {
          this.$message({ type: 'info', message: '重命名失败!重命名资源名称已由现有对象使用' })
        }
      })
      this.resourceForm.resourceName = ''
      this.folderFormVisible = false
      this.$emit('refresh')
    },
    // 新增表
    add() {
      this.openType = 'addTable'
      this.tableShowVisible = true
      this.tabShow = 'column'
      this.tableId = '1'
    },
    // 上传表
    uploadTable() {
      this.uploadtemp = {}
      this.uploadtempInfo = []
      this.uploadStep = 1
      this.uploadVisible = true
    },
    // 表结构维护
    update() {
      this.openType = 'updateTable'
      this.tableShowVisible = true
      this.tabShow = 'column'
      this.tableId = this.selections[0].id
    },
    // 得到分页列表
    getListSelect(query) {
      if (query) {
        var list = this.allList.filter(obj => { return obj.label.indexOf(query.label) !== -1 })
        this.total = getArrLength(list)
        this.temp = list
      } else {
        this.temp = this.allList
        this.total = getArrLength(this.temp)
      }
    },
    // 初始化列表页面
    getList(data, node, tree) {
      this.clickData = data
      console.log(data)
      this.clickNode = node
      this.clickFullPath = []
      this.clickFullPath.push(data.label)
      var newNode = node.parent
      while (newNode.parent != null) {
        this.clickFullPath.push(newNode.data.label)
        if (newNode.parent != null) {
          newNode = newNode.parent
        }
      }
      if (data.type === 'table') {
        this.temp = []
        this.allList = []
        var tempObj = {}
        tempObj = data
        this.temp.push(tempObj)
        this.allList.push(tempObj)
        // 父节点node
        this.total = 1
      } else {
        this.temp = data.children
        this.allList = data.children
        // eslint-disable-next-line no-undef
        this.total = getArrLength(data.children)
        this.getListSelect()
      }
    },
    createFolder() {
      if (this.clickData.extMap.folderType === 'virtual') {
        this.$message({ type: 'info', message: '创建失败!该文件为系统文件夹不允许创建' })
        return
      }
      this.dialogStatus = 'createFolder'
      this.typeLabel = '重命名文件夹名称'
      this.resourceForm.resourceName = ''
      this.folderFormVisible = true
    },
    // 保存新建文件夹
    createFolderSave() {
      this.resourceForm.parentFolderUuid = this.clickData.id
      this.resourceForm.fullPath = this.clickFullPath.reverse().join('/')
      this.resourceForm.folderName = this.resourceForm.resourceName
      this.resourceForm.createUserUuid = this.$store.state.user.code
      saveFolder(this.resourceForm).then(resp => {
        var childData = {
          id: resp.data,
          label: this.resourceForm.folderName,
          pid: this.resourceForm.parentFolderUuid,
          type: 'folder',
          extMap: {
            folder_type: 'maintained'
          }
        }
        // 添加节点
        this.$emit('append-node', childData, this.clickNode)
        this.$notify({
          title: '成功',
          message: '新建成功',
          type: 'success',
          duration: 3000,
          position: 'bottom-right'
        })
        this.folderFormVisible = false
      })
    },
    // 预览表结构
    showTable() {
      if (this.selections[0].type === 'folder') {
        this.$message({ type: 'info', message: '请选择数据表进行查看!' })
      } else {
        this.openType = 'showTable'
        this.tableShowVisible = true
        this.tabShow = 'basicinfo'
        this.tableId = this.selections[0].id
      }
    },
    // 预览数据
    preview() {
      preview(this.selections[0]).then(res => {
        this.executeSQLList = res.data.executeTask.executeSQL
        debugger
        this.arrSql = res.data
        this.previewVisible = true
        this.$nextTick(() => {
          this.$refs.childTabs.loadTableData(this.arrSql)
        })
      })
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSelectionChange(val) {
      this.selections = val
      var objTotal = getArrLength(this.selections)
      if (objTotal === 1) {
        if (this.selections[0].extMap.accessType.indexOf('SAVE_TO_FOLDER') > -1) {
          this.saveFlag = false
        } else {
          this.saveFlag = true
        }
        if (this.selections[0].extMap.accessType.indexOf('FETCH_TABLE_DATA') > -1) {
          this.infoFlag = false
        } else {
          this.infoFlag = true
        }
      } else {
        this.saveFlag = true
        this.infoFlag = true
      }
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    // 将字节数转换成大小
    formatTableSize(limit) {
      if (limit === '') {
        return ''
      }
      if (limit === undefined) {
        limit = 0
      }
      var size = ''
      if (limit < 1 * 1024) { // 小于1KB，则转化成B
        size = parseFloat(limit).toFixed(2) + 'B'
      } else if (limit < 1 * 1024 * 1024) { // 小于1MB，则转化成KB
        size = (limit / 1024).toFixed(2) + 'KB'
      } else if (limit < 1 * 1024 * 1024 * 1024) { // 小于1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
      } else { // 其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
      }
      var sizeStr = size + '' // 转成字符串
      var index = sizeStr.indexOf('.') // 获取小数点处的索引
      var dou = sizeStr.substr(index + 1, 2) // 获取小数点后两位的值
      if (dou === '00') { // 判断后两位是否为00，如果是则删除00
        return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
      }
      return size
    },
    formatCreateTime(createTime) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      if (createTime) {
        var date = new Date(createTime)
        var Y = date.getFullYear()
        var M = date.getMonth() + 1
        var D = date.getDate()
        var HH = date.getHours()
        var MM = date.getMinutes()
        var SS = date.getSeconds()
        if (M < 10) {
          M = '0' + M
        }
        if (D < 10) {
          D = '0' + D
        }
        if (HH < 10) {
          HH = '0' + HH
        }
        if (MM < 10) {
          MM = '0' + MM
        }
        if (SS < 10) {
          SS = '0' + SS
        }
        return Y + '-' + M + '-' + D + ' ' + HH + ':' + MM + ':' + SS
      } else {
        return ''
      }
    }
  }
}
</script>

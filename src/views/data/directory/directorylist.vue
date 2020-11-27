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
        <el-button type="primary" :disabled="selections.length === 0" title="删除" class="oper-btn delete" @click="delData()" />
        <el-button type="primary" class="oper-btn iconoper-cancel" :disabled="selections.length !== 1" title="复制" @click="copyResource()" />
        <el-button type="primary" class="oper-btn iconoper-publish" title="移动" :disabled="clickData===null" @click="movePath()" />
        <el-button type="primary" class="oper-btn edit" title="重命名" :disabled="selections.length !== 1" @click="renameResource()" />
        <el-button type="primary" class="oper-btn add" title="新增表" :disabled="selections.length !== 1" @click="add" />
        <el-button type="primary" class="oper-btn add-folder" title="新增文件夹" :disabled="clickData.type == 'table'" @click="createFolder()" />
        <el-button type="primary" class="oper-btn  iconmenu-2" title="表结构维护" :disabled="selections.length !== 1" @click="add" />
        <el-button type="primary" class="oper-btn  iconmenu-1" title="表结构展示" :disabled="selections.length !== 1" @click="showTable()" />
        <el-button type="primary" class="oper-btn iconoper-show" title="预览" :disabled="selections.length !== 1 || selections[0].type =='folder'" @click="preview()" />
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
        <el-button v-if="dialogStatus==='copyTable'" type="primary" @click="copyResourceSave()">确定</el-button>
        <el-button v-if="dialogStatus==='createFolder'" type="primary" @click="createFolderSave()">确定</el-button>
        <el-button v-if="dialogStatus==='updateFolder'||dialogStatus==='updateTable'" type="primary" @click="renameResourceSave()">确定</el-button>
        <el-button @click="folderFormVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗2 -->
    <el-dialog :visible.sync="moveTreeVisible" width="600px">
      <dataTree ref="dataTree" :data-user-id="dataUserId" :scene-code="sceneCode" @node-click="nodeclick" />
      <span slot="footer">
        <el-button type="primary" @click="movePathSave()">确定</el-button>
        <el-button @click="moveTreeVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗3 -->
    <el-dialog v-if="tableShowVisible" :visible.sync="tableShowVisible" width="800px">
      <el-row>
        <el-col>
          <tabledatatabs ref="tabledatatabs" :table-id="tableId" :open-type="openType" :tab-show.sync="tabShow" />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button @click="tableShowVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <!-- 弹窗4 -->
    <el-dialog v-if="previewVisible" :visible.sync="previewVisible" width="800px">
      <el-row>
        <el-col>
          <childTabs ref="childTabs" :pre-value="executeSQLList" use-type="previewTable" />
        </el-col>
      </el-row>
      <span slot="footer">
        <el-button @click="previewVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import tabledatatabs from '@/views/data/table/tabledatatabs'
import childTabs from '@/views/analysis/auditmodelresult/childtabs'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import QueryField from '@/components/Ace/query-field/index'
import { getArrLength } from '@/utils'
import { deleteDirectory, copyTable, renameResource, movePath, preview } from '@/api/data/directory'
import { saveFolder } from '@/api/data/folder'
import dataTree from '@/views/data/role-res/data-tree'
export default {
  components: { Pagination, QueryField, dataTree, childTabs, tabledatatabs },
  filters: {

  },
  data() {
    return {
      dataUserId: this.$store.getters.personcode,
      openType: '',
      sceneCode: 'auditor',
      tableKey: 'bizAttrUuid',
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
      clickData: { type: '' },
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
    // this.getList(this.data, this.node, this.tree)
  },
  methods: {
    formatTableType(row, column) {
      return row.type === 'table' ? '数据表' : '文件夹'
    },
    // 删除资源
    delData() {
      var ids = []
      this.selections.forEach((r, i) => {
        if (r.type === 'folder') {
          if (r.extMap.folderType === 'virtual') {
            this.$message({ type: 'info', message: '该文件为系统文件夹不允许重命名!' })
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
      deleteDirectory(ids).then(() => {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 5000,
          position: 'bottom-right'
        })
      })
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
      debugger
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
    add() {
      alert(1)
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
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    },
    // 将字节数转换成大小
    formatTableSize(limit) {
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

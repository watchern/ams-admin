<template>
  <div class="app-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getList"
      />
    </div>
    <div>
      <el-button type="danger" size="mini" :disabled="selections.length === 0" @click="handleDelete()">删除</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">复制</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">移动</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">重命名</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">新建表</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">新建文件夹</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">表结构维护</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">表结构展示</el-button>
      <el-button type="primary" size="mini" @click="handleCreate()">预览数据</el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="temp"
      border
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="名称" align="center" prop="label" />
      <el-table-column label="资源类型" align="center" :formatter="formatTableType" prop="type" />
      <el-table-column label="创建时间" align="center" :formatter="formatCreateTime" prop="createTime" />
      <el-table-column label="大小" :formatter="formatTableSize" prop="tbSizeByte" />
    </el-table>
    <!-- <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" /> -->
  </div>
</template>

<script>
import QueryField from '@/components/Ace/query-field/index'
export default {
  components: { QueryField },
  filters: {

  },
  data() {
    return {
      tableKey: 'bizAttrUuid',
      list: null,
      data: null,
      node: null,
      tree: null,
      total: 0,
      listLoading: false,
      // text 精确查询   fuzzyText 模糊查询  select下拉框  timePeriod时间区间
      queryFields: [
        { label: '业务属性编码', name: 'attrCode', type: 'text', value: '' },
        { label: '业务属性名称', name: 'attrName', type: 'fuzzyText' },
        // {label: '性别', name:'sex', type: 'select',
        //   data: [{name: '男', value: '1'}, {name: '女', value: '0'}],
        //   default: '1'},
        { label: '创建时间', name: 'createTime', type: 'timePeriod' }
      ],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: [{
        label: '',
        type: '',
        createTime: '',
        tbSizeByte: ''
      }],
      selections: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑业务属性',
        create: '添加业务属性'
      },
      dialogPvVisible: false,
      rules: {
        attrName: [{ required: true, message: '请填写业务属性名称', trigger: 'change' }],
        attrCode: [{ required: true, message: '请填写业务属性编码', trigger: 'change' }],
        describe: [{ max: 100, message: '长度不得超过100', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    // this.getList(this.data, this.node, this.tree)
  },
  methods: {
    formatTableType(row, column) {
      return row.type === 'table' ? '数据表' : '文件夹'
    },
    formatTableSize(row, column) {
      var limit = row.tbSizeByte
      var size = ''
      if (limit < 1 * 1024) { // 小于1KB，则转化成B
        size = limit.toFixed(2) + 'B'
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
    formatCreateTime(row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      if (row.createTime) {
        var date = new Date(row.createTime)
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
    },
    getList(data, node, tree) {
      var path = ''
      if (data.type === 'table') {
        this.temp = []
        var tempObj = {}
        tempObj.label = data.label
        tempObj.type = data.type
        tempObj.createTime = data.extMap.createTime
        tempObj.tbSizeByte = data.extMap.tbSizeByte
        this.temp.push(tempObj)
        // 父节点node
        var newNode = node.parent
        while (newNode.parent != null) {
          path = newNode.data.label + '//' + path
          if (newNode.parent != null) {
            newNode = newNode.parent
          }
        }
      } else {
        this.temp = data.children
      }
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
        bizAttrUuid: undefined,
        attrName: '',
        attrCode: '',
        describe: ''
      }
    },
    handleCreate() {
      /* console.log(this.$store.getters.personuuid);
      getDict('sex').then(data => {
        console.log(data)
      });*/
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
    }
  }
}
</script>

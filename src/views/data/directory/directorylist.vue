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
        <el-button type="primary" class="oper-btn iconoper-cancel" title="复制" @click="handleCreate()" />
        <el-button type="primary" class="oper-btn iconoper-publish" title="移动" @click="handleCreate()" />
        <el-button type="primary" class="oper-btn edit" title="重命名" @click="handleCreate()" />
        <el-button type="primary" class="oper-btn add" title="新增表" @click="add" />
        <el-button type="primary" class="oper-btn add-folder" title="新增文件夹" @click="add" />
        <el-button type="primary" class="oper-btn  iconmenu-2" title="表结构维护" @click="add" />
        <el-button type="primary" class="oper-btn  iconmenu-1" title="表结构展示" @click="add" />
        <el-button type="primary" class="oper-btn iconoper-show" title="预览" @click="add" />
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
  </div>
</template>
<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import QueryField from '@/components/Ace/query-field/index'
import { getArrLength } from '@/utils'
import { del } from '@/api/data/directory'
export default {
  components: { Pagination, QueryField },
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
      allList: [],
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
    },
    getListSelect(query) {
      if (query.label) {
        var list = this.allList.filter(obj => { return obj.label.indexOf(query.label) !== -1 })
        this.total = getArrLength(list)
        this.temp = list
      } else {
        this.temp = this.allList
        this.total = getArrLength(this.temp)
      }
    },
    getList(data, node, tree) {
      var path = ''
      if (data.type === 'table') {
        this.temp = []
        this.allList = []
        var tempObj = {}
        tempObj = data
        this.temp.push(tempObj)
        this.allList.push(tempObj)
        // 父节点node
        var newNode = node.parent
        while (newNode.parent != null) {
          path = newNode.data.label + '//' + path
          if (newNode.parent != null) {
            newNode = newNode.parent
          }
        }
        this.total = 1
      } else {
        console.log(data.children)
        this.temp = data.children
        this.allList = data.children
        // eslint-disable-next-line no-undef
        this.total = getArrLength(data.children)
        this.getListSelect(null)
      }
    },
    delData() {
      var ids = []
      this.selections.forEach((r, i) => {
        if (r.type === 'fold') {
          var foldObj = this.allList.filter(obj => { return obj.label === r.label })
          var objTotal = getArrLength(foldObj[0].children)
          if (objTotal > 0) {
            ids.push(foldObj[0].label)
          }
        }
      })
      del(ids).then(() => {
        this.getList()
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
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

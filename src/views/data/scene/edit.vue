<template>
  <div class="app-container" style="overflow: auto;">

    <div class="detail-form">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        style="width: 700px;"
      >
        <span class="midText">业务场景维护：</span>
        <el-row>
          <el-col :span="12">
            <el-form-item label="业务场景名称" prop="sceneName" label-width="150px">
              <el-input v-model="temp.sceneName" class="input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务属性编码" prop="sceneCode" label-width="150px">
              <el-input v-model="temp.sceneCode" class="input" />
            </el-form-item>
          </el-col>
        </el-row></el-form>
      <div style="height :160px">
        <div class="tableTitle"><span class="midText">用户组定义：</span></div>
        <div style="float:right">
          <el-button type="primary" size="mini" class="oper-btn add" @click="handleCreate()" />
        </div>
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="list"
          border
          highlight-current-row
          style="width: 100%;max-height :150px;overflow: auto;"
          @sort-change="sortChange"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column label="组名称" width="200px" align="center" prop="grpName" />
          <el-table-column label="组代码" width="200px" align="center" prop="grpCode" />
          <el-table-column label="组用户来源SQL" width="300px" align="center" prop="grpSql" show-overflow-tooltip />
          <el-table-column label="创建时间" width="300px" align="center" prop="createTime" :formatter="formatCreateTime" />
          <el-table-column label="操作" align="center" min-width="100">
            <template slot-scope="scope">
              <el-button type="primary" class="oper-btn detail" size="mini" @click="selectFilterOne(scope.row.sceneGrpUuid)" />
              <el-button type="primary" class="oper-btn edit" size="mini" @click="updateGrp(scope.row.sceneGrpUuid)" />
              <el-button type="danger" class="oper-btn delete" size="mini" @click="deleteGrp(scope.row.sceneGrpUuid)" />
            </template>
          </el-table-column>
        </el-table>
        <!-- <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" /> -->

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
          <div class="detail-form">
            <el-form
              ref="dataFormGrp"
              :rules="rulesGrp"
              :model="tempGrp"
              label-position="right"
              style="width: 600px;hieght:400px;margin-left:50px;"
            >
              <el-form-item label="组名称" prop="grpName">
                <el-input v-model="tempGrp.grpName" style="width:500px" />
              </el-form-item>
              <el-form-item label="组代码" prop="grpCode">
                <el-input v-model="tempGrp.grpCode" style="width:500px" />
              </el-form-item>
              <el-form-item label="组用户来源SQL(所写SQL中必须有id,name,pid 三列才可预览查看)" prop="grpSql">
                <el-input v-model="tempGrp.grpSql" :rows="6" type="textarea" style="width:500px" />
              </el-form-item>
            </el-form>
          </div>
          <div slot="footer">
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
          </div>
        </el-dialog>
      </div>

      <div style="height :260px;margin-top:150px">
        <div class="tableTitleFilter"><span>维护业务场景下数据筛选器：</span></div>
        <div style="float:right">
          <el-button type="primary" size="mini" class="oper-btn add" @click="handleCreateFilter()" /></div>
        <el-table
          :key="tableKeyFilter"
          v-loading="listLoadingFilter"
          :data="listFilter"
          border
          highlight-current-row
          style="width: 100%;max-height :150px;overflow: auto;"
          @sort-change="sortChangeFilter"
          @selection-change="handleSelectionChangeFilter"
        >
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column label="筛选器名称" width="200px" align="center" prop="filterName" />
          <el-table-column label="IN值SQL" width="300px" align="center" prop="inValueSql" show-overflow-tooltip />
          <el-table-column label="描述" width="100px" align="center" prop="describe" />
          <el-table-column label="操作" align="center" min-width="100">
            <template slot-scope="scope">
              <el-button type="primary" class="oper-btn detail" size="mini" @click="selectFilterOne(scope.row.inValueSql)" />
              <el-button type="primary" class="oper-btn edit" size="mini" @click="updateFilter(scope.row.sceneFilterUuid)" />
              <el-button type="danger" class="oper-btn delete" size="mini" @click="deleteFilter(scope.row.sceneFilterUuid)" />
            </template>
          </el-table-column>
        </el-table>
        <!-- <pagination v-show="totalFilter>0" :total="totalFilter" :page.sync="pageQueryFilter.pageNo" :limit.sync="pageQueryFilter.pageSize" @pagination="getListFilter" /> -->

        <el-dialog :title="textMapFilter[dialogStatusFilter]" :visible.sync="dialogFormVisibleFilter">
          <div class="detail-form">
            <el-form
              ref="dataFormFilter"
              :rules="rulesFilter"
              :model="tempFilter"
              label-position="right"
              style="width: 600px;hieght:400px;margin-left:50px;"
            >
              <el-form-item label="筛选器名称" prop="filterName">
                <el-input v-model="tempFilter.filterName" style="width:500px" />
              </el-form-item>
              <el-form-item label="IN值SQL" prop="inValueSql">
                <el-input v-model="tempFilter.inValueSql" type="textarea" :rows="5" style="width:500px" />
              </el-form-item>
              <el-form-item label="描述" prop="describe">
                <el-input v-model="tempFilter.describe" type="textarea" :rows="4" style="width:500px" />
              </el-form-item>
              <el-form-item label="关联业务属性" prop="bizAttrUuid">
                <el-select ref="bizAttrUuid" v-model="tempFilter.bizAttrUuid" style="width:500px" placeholder="请选择业务属性">
                  <el-option
                    v-for="item in bizJson"
                    :key="item.bizAttrUuid"
                    :label="item.attrName"
                    :value="item.bizAttrUuid"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div slot="footer">
            <el-button @click="dialogFormVisibleFilter = false">取消</el-button>
            <el-button type="primary" @click="dialogStatusFilter==='create'?createDataFilter():updateDataFilter()">确定</el-button>
          </div>
        </el-dialog>

        <el-dialog :title="预览" :visible.sync="dialogFormVisibleTree">
          <MyElTree
            ref="tree1"
            v-loading="tree1Loading"
            :props="props"
            class="filter-tree"
            :highlight-current="true"
            :data="treeData1"
            node-key="id"
            :filter-node-method="filterNode"
            show-checkbox
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <i v-if="data.id==='root'" class="el-icon-s-home" style="color:#409EFF" />
              <i v-if="data.type==='folder'" class="el-icon-folder" style="color:#409EFF" />
              <i v-if="data.type==='table'" class="el-icon-tickets" style="color:#409EFF" />
              <i v-if="data.type==='column'" class="el-icon-c-scale-to-original" style="color:#409EFF" />
              <span :title="node.name">{{ node.label }}</span>
            </span>
          </MyElTree>
        </el-dialog>
      </div>
    </div>
    <div slot="footer" style="float:right; margin-right:100px">
      <el-button @click="closeEdit()">返回</el-button>
      <el-button type="primary" @click="saveScene()">确定</el-button>
    </div>
  </div>
</template>

<script>
import MyElTree from '@/components/Ace/tree/src/tree.vue'
import { update, initSceneTree } from '@/api/data/scene'
import { listByPage } from '@/api/data/biz-attr'
import { listByPageGrp, saveGrp, updateGrp, delGrp, getById } from '@/api/data/sceneGrp'
import { listByPageFilter, saveFilter, updateFilter, delFilter, getByIdFilter } from '@/api/data/sceneFilter'
export default {
  components: { MyElTree },
  data() {
    return {
      treeData1: [],
      tableKey: 'sceneUuid',
      tableKeyFilter: 'sceneUuid',
      list: null,
      listFilter: null,
      props: {
        label: 'label',
        isLeaf: 'leaf'
      },
      total: 0,
      totalFilter: 0,
      listLoading: false,
      listLoadingFilter: false,
      tree1Loading: false,
      bizJson: [],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      pageQueryFilter: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      temp: {
        sceneUuid: undefined,
        sceneName: '',
        sceneCode: '',
        describe: ''
      },
      tempGrp: {
        sceneGrpUuid: undefined,
        grpName: '',
        grpCode: '',
        grpSql: ''
      },
      tempFilter: {
        sceneGrpUuid: undefined,
        inValueSql: '',
        describe: '',
        bizAttrUuid: ''
      },
      selections: [],
      selectionsFilter: [],
      dialogFormVisible: false,
      dialogFormVisibleFilter: false,
      dialogFormVisibleTree: false,
      dialogStatus: '',
      dialogStatusFilter: '',
      textMap: {
        update: '修改用户组定义',
        create: '新增用户组定义'
      },
      textMapFilter: {
        update: '修改数据筛选器',
        create: '新增数据筛选器'
      },
      rules: {
        sceneName: [{ required: true, message: '请填写场景名称', trigger: 'change' }],
        sceneCode: [{ required: true, message: '请填写场景编码', trigger: 'change' }]
      },
      rulesGrp: {
        grpName: [{ required: true, message: '请填写组名称', trigger: 'change' }],
        grpCode: [{ required: true, message: '请填写组编号', trigger: 'change' }],
        grpSql: [{ required: true, message: '请填写组SQL', trigger: 'change' }]
      },
      rulesFilter: {
        filterName: [{ required: true, message: '请填写筛选器名称', trigger: 'change' }],
        inValueSql: [{ required: true, message: '请填写IN值SQL', trigger: 'change' }],
        describe: [{ required: true, message: '请填写描述', trigger: 'change' }],
        bizAttrUuid: [{ required: true, message: '请选择业务属性', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.allList()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 初始化页面所有列表
    allList() {
      this.temp.sceneUuid = this.$route.query.sceneUuid
      this.temp.sceneName = this.$route.query.sceneName
      this.temp.sceneCode = this.$route.query.sceneCode
      this.getList()
      this.getListFilter()
    },
    selectFilterOne(sceneGrpUuid) {
      this.dialogFormVisibleTree = true
      initSceneTree(sceneGrpUuid).then(resp => {
        this.treeData1 = resp.data
      })
    },
    // 初始化用户组定义
    getList() {
      this.listLoading = true
      this.pageQuery.condition = this.temp
      listByPageGrp(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    // 初始化数据筛选器
    getListFilter() {
      this.listLoadingFilter = true
      this.pageQueryFilter.condition = this.temp
      listByPageFilter(this.pageQueryFilter).then(resp => {
        this.totalFilter = resp.data.total
        this.listFilter = resp.data.records
        this.listLoadingFilter = false
      })
    },
    // 格式化创建时间显示列表
    formatCreateTime(row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.createTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
    },
    // 预览用户组
    selectGrpOne() {

    },
    // 删除用户组
    deleteGrp(id) {
      delGrp(id).then(() => {
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
    // 删除关联数据筛选器
    deleteFilter(id) {
      delFilter(id).then(() => {
        this.getListFilter()
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
      })
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
    sortChangeFilter(data) {
      const { prop, order } = data
      this.pageQueryFilter.sortBy = order
      this.pageQueryFilter.sortName = prop
      this.handleFilter()
    },
    // 重置用户组对象
    resetTemp() {
      this.tempGrp = {
        sceneGrpUuid: undefined,
        grpName: '',
        grpCode: '',
        grpSql: ''
      }
    },
    // 重置数据筛选器对象
    resetTempFilter() {
      this.tempFilter = {
        sceneFilterUuid: undefined,
        bizAttrUuid: '',
        filterName: '',
        inValueSql: '',
        describe: ''
      }
    },
    // 打开创建用户组窗口
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataFormGrp'].clearValidate()
      })
    },
    // 初始化创建数据筛选器窗口
    handleCreateFilter() {
      listByPage(this.pageQueryFilter).then(resp => {
        this.bizJson = resp.data.records
      })
      this.resetTempFilter()
      this.dialogStatusFilter = 'create'
      this.dialogFormVisibleFilter = true
      this.$nextTick(() => {
        this.$refs['dataFormFilter'].clearValidate()
      })
    },
    // 新增用户组
    createData() {
      this.tempGrp.sceneUuid = this.$route.query.sceneUuid
      this.$refs['dataFormGrp'].validate((valid) => {
        if (valid) {
          saveGrp(this.tempGrp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    // 新增关联数据筛选器
    createDataFilter() {
      this.tempFilter.sceneUuid = this.$route.query.sceneUuid
      this.$refs['dataFormFilter'].validate((valid) => {
        if (valid) {
          saveFilter(this.tempFilter).then(() => {
            this.getListFilter()
            this.dialogFormVisibleFilter = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    // 数据过滤器修改时回显
    updateGrp(id) {
      getById(id).then(res => {
        this.tempGrp = Object.assign({}, res.data) // copy obj
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataFormGrp'].clearValidate()
      })
    },
    // 数据过滤器修改时回显
    updateFilter(id) {
      getByIdFilter(id).then(res => {
        this.tempFilter = Object.assign({}, res.data) // copy obj
      })
      listByPage(this.pageQueryFilter).then(resp => {
        this.bizJson = resp.data.records
      })
      this.dialogStatusFilter = 'update'
      this.dialogFormVisibleFilter = true
      this.$nextTick(() => {
        this.$refs['dataFormFilter'].clearValidate()
      })
    },
    // 修改用户组
    updateData() {
      this.$refs['dataFormGrp'].validate((valid) => {
        if (valid) {
          var tempData = Object.assign({}, this.tempGrp)
          updateGrp(tempData).then(() => {
            const index = this.list.findIndex(v => v.sceneGrpUuid === this.tempGrp.sceneGrpUuid)
            this.list.splice(index, 1, this.tempGrp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    // 修改数据过滤器
    updateDataFilter() {
      this.$refs['dataFormFilter'].validate((valid) => {
        if (valid) {
          var tempData = Object.assign({}, this.tempFilter)
          console.log(tempData)
          updateFilter(tempData).then(() => {
            const index = this.listFilter.findIndex(v => v.sceneFilterUuid === this.tempFilter.sceneFilterUuid)
            this.listFilter.splice(index, 1, this.tempFilter)
            this.dialogFormVisibleFilter = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    // 保存业务场景表单信息
    saveScene() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          var tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            this.closeEdit()
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          })
        }
      })
    },
    // 退出业务场景维护详情信息
    closeEdit() {
      this.$router.push({
        path: `/data/scene`
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    handleSelectionChangeFilter(val) {
      this.selectionsFilter = val
    },
    getSortClass: function(key) {
      const sort = this.pageQuery.sort
      return sort === `+${key}` ? 'asc' : 'desc'
    }
  }
}
</script>

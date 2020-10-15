<template>
  <!-- firstParentTabCon.vue界面是父页签第一个页签中的内容 -->
  <div class="app-container">
    <div class="filter-container">
      <QueryField
        ref="queryfield"
        :form-data="queryFields"
        @submit="getLikeList"
      />
    </div>
    <el-row>
      <el-button
        type="primary"
        @click="relationProject('453453', '项目2')"
      >关联项目</el-button>
      <el-button
        type="danger"
        @click="RemoverelationProject('asdasdasdas')"
      >移除项目关联</el-button>
      <el-button type="danger" @click="deleteRunTaskRel">删除</el-button>
      <el-button type="primary">结果拆分</el-button>
      <el-button
        type="primary"
        @click="modelResultShare('99999', '888888')"
      >结果共享</el-button>
      <el-button type="primary" @click="exportExcel">导出</el-button>
    </el-row>
    <el-table
      id="table"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="模型名称"
        width="100px"
        align="center"
        prop="model.modelName"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="
              getResultTables(
                scope.row.runResultTables,
                scope.row.model.modelName,
                scope.row.model.modelUuid
              )
            "
          >{{ scope.row.model.modelName }}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="运行状态"
        width="100px"
        align="left"
        prop="runStatus"
        :formatter="readStatusFormatter"
      />
      <el-table-column
        label="运行人"
        width="100px"
        align="center"
        prop="runTask.runUserName"
      />
      <el-table-column
        label="运行信息"
        prop="runMessage"
        align="center"
        width="200px"
      />
      <el-table-column
        label="运行开始时间"
        width="200px"
        align="center"
        prop="runTask.runStartTime"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="运行结束时间"
        width="200px"
        align="center"
        prop="runTask.runEndTime"
        :formatter="dateFormatter1"
      />
      <el-table-column
        label="运行SQL"
        prop="settingInfo.sql"
        align="center"
        width="200px"
      />
      <el-table-column
        label="运行参数"
        prop="settingInfo.param"
        align="center"
        width="200px"
      />

      <el-table-column
        label="执行进度"
        prop="executeProgress"
        align="center"
        width="200px"
      >
        <template slot-scope="scope">
          <el-progress
            :percentage="parseInt(scope.row.executeProgress)"
            :color="customColorMethod(scope.row.executeProgress)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="关联项目"
        prop="projectName"
        align="center"
        width="200px"
      />
      <el-table-column
        v-if="false"
        label="运行结果共享表主键"
        prop="runResultShare.runResultShareUuid"
        align="center"
        width="200px"
      />
      <el-table-column fixed="right" label="操作" width="120">
        <template>
          <el-button type="primary">重新运行</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageQuery.pageNo"
      :limit.sync="pageQuery.pageSize"
      @pagination="getLikeList"
    />
  </div>
</template>
<script>
import {
  getRunTaskRelByPage,
  batchDeleteRunTaskRel,
  ResultRelProject,
  rmResultRelProjectlr,
  insertRunResultShare,
  deleteRunResultShare,
  exportRunTaskRel
} from '@/api/analysis/auditModelResult'
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
import data from '@/views/pdf/content'
import { elementInside } from 'dropzone'
import axios from 'axios'
import VueAxios from 'vue-axios'
import AV from 'leancloud-storage'
export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'errorUuid',
      list: null,
      total: 0,
      listLoading: false,
      queryFields: [
        { label: '模型名称', name: 'modelName', type: 'fuzzyText' },
        { label: '运行人', name: 'runUserName', type: 'fuzzyText' },
        { label: '运行sql', name: 'sql', type: 'fuzzyText' },
        { label: '运行参数', name: 'param', type: 'fuzzyText' },
        { label: '执行时间范围', name: 'runStartTime', type: 'timePeriod' }
      ],
      formStyle: {
        width: '700px',
        height: '400px'
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20
      },
      share: [], // 存储共享的运行结果
      notShare: [], // 存储不是共享的运行结果
      success: false, // 用来测试open2方法里的batchDeleteRunTaskRel方法返回值是否为true，如果为true则success为true
      success1: false, // 用来测试open2方法里的deleteRunResultShare方法返回值是否为true，如果为true则success为true
      selected1: [] // 存储表格中选中的数据
    }
  },
  computed: {},
  created() {
    this.getLikeList()
  },
  methods: {
    /**
     * 导出方法
     */
    exportExcel() {
      axios({
        method: 'get',
        url: '/analysis/RunTaskRelController/exportRunTaskRelTable',
        responseType: 'blob'
      }).then((res) => {
        console.log(res)
        const link = document.createElement('a')
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', '模型运行结果表.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    },
    customColorMethod(percentage) {
      if (percentage < 30) {
        return '#909399'
      } else if (percentage < 70) {
        return '#e6a23c'
      } else {
        return '#67c23a'
      }
    },
    /**
     * 格式化时间字符串
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的字符串
     */
    dateFormatter(row, column) {
      const datetime = row.runTask.runStartTime
      if (datetime) {
        var dateMat = new Date(datetime)
        var year = dateMat.getFullYear()
        var month = dateMat.getMonth() + 1
        var day = dateMat.getDate()
        var hh = dateMat.getHours()
        var mm = dateMat.getMinutes()
        var ss = dateMat.getSeconds()
        var timeFormat =
          year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
        return timeFormat
      }
      return ''
    },
    /**
     格式化时间字符串
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的字符串
     */
    dateFormatter1(row, column) {
      const datetime = row.runTask.runEndTime
      if (datetime) {
        var dateMat = new Date(datetime)
        var year = dateMat.getFullYear()
        var month = dateMat.getMonth() + 1
        var day = dateMat.getDate()
        var hh = dateMat.getHours()
        var mm = dateMat.getMinutes()
        var ss = dateMat.getSeconds()
        var timeFormat =
          year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
        return timeFormat
      }
      return ''
    },
    /**
     * 格式化已阅状态
     * @param row 行数据
     * @param column 列数据
     * @returns {string} 返回格式化后的数据
     */
    readStatusFormatter(row, column) {
      var status = row.runStatus
      if (status == 1) {
        return '待运行'
      } else if (status == 2) {
        return '运行中'
      } else if (status == 3) {
        return '运行成功'
      } else {
        return '运行失败'
      }
    },
    /**
     * 查询列表方法
     */
    getLikeList(query) {
      this.listLoading = true
      var model = {}
      var runTask = {}
      if (query) {
        if (query.modelName == null || query.modelName == '') {
          model = null
        } else {
          model = { modelName: query.modelName }
        }
        if (query.runUserName == null || query.runUserName == '') {
          var runTask = null
        } else {
          var runTask = { runUserName: query.runUserName }
        }
        query.model = model
        query.runTask = runTask
        this.pageQuery.condition = query
      }
      getRunTaskRelByPage(this.pageQuery).then((resp) => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    /**
     * 当多选框改变时触发
     */
    handleSelectionChange(val) {
      this.share.splice(0, this.share.length)
      this.notShare.splice(0, this.notShare.length)
      // 把共享过来的运行结果放进share数组，自己的运行结果放进notShare数组
      for (var i = 0; i < val.length; i++) {
        if (val[i].runResultShare.runResultShareUuid != null) {
          this.share.push(val[i])
        } else {
          this.notShare.push(val[i])
        }
      }
      // 把选中的所有数据赋值给selected1，供后续方法使用
      this.selected1 = val
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getLikeList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    /**
     * 点击删除按钮触发的事件
     */
    deleteRunTaskRel() {
      if (this.share.length == 0 && this.notShare.length == 0) {
        alert('请选择要删除的运行结果')
      } else if (this.notShare.length != 0 && this.share.length == 0) {
        // 当选中的要删除结果中都是自己的没有别人共享结果的时候
        var flag = true
        // 判断选中的项目中是否有关联的项目
        for (var i = 0; i < this.notShare.length; i++) {
          if (this.notShare[i].projectName != null) {
            flag = false
            break
          }
        }
        // 如果有关联的项目
        if (flag == false) {
          alert('选择的运行结果有项目关联，请取消关联，再删除！')
        } else {
          // 打开删除提示框
          this.open()
        }
      } else if (this.notShare.length == 0 && this.share.length != 0) {
        // 当选中的要删除结果中没有自己的都是别人共享结果的时候
        // 打开删除提示框
        this.open1()
      } else {
        // 当选中的要删除结果中有自己的也有别人共享结果的时候
        var flag = true
        // 判断自己的结果中有无项目关联
        for (var i = 0; i < this.notShare.length; i++) {
          if (this.notShare[i].projectName != null) {
            flag = false
            break
          }
        }
        if (flag == false) {
          alert('选择的运行结果有项目关联，请取消关联，再删除！')
        } else {
          // 打开删除提示框
          this.open2()
        }
      }
    },
    /**
     * 打开确认删除弹出层,当勾选中共享结果为0是打开，非共享不为0时调用
     */
    open() {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          var ids = []
          for (var i = 0; i < this.notShare.length; i++) {
            ids[i] = this.notShare[i].runTaskRelUuid
          }
          batchDeleteRunTaskRel(ids.join(',')).then((resp) => {
            if (resp.data == true) {
              this.getLikeList()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    /**
     * 当共享的长度不为0，非共享长度为0时调用
     */
    open1() {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          var ids = []
          for (var i = 0; i < this.share.length; i++) {
            ids[i] = this.share[i].runResultShare.runResultShareUuid
          }
          deleteRunResultShare(ids.join(',')).then((resp) => {
            if (resp.data == true) {
              this.getLikeList()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    /**
     * 当共享和非共享都不为0的时候调用
     */
    open2() {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          this.success = false
          this.success1 = false
          var ids1 = []
          var ids = []
          for (var i = 0; i < this.notShare.length; i++) {
            ids1[i] = this.notShare[i].runTaskRelUuid
          }
          batchDeleteRunTaskRel(ids1.join(',')).then((resp) => {
            if (resp.data == true) {
              this.success = true
            }
          })
          for (var i = 0; i < this.share.length; i++) {
            ids[i] = this.share[i].runResultShare.runResultShareUuid
          }
          deleteRunResultShare(ids.join(',')).then((resp) => {
            if (resp.data == true) {
              this.success1 = true
            }
            if (this.success == true && this.success1 == true) {
              this.getLikeList()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    /**
     * 关联项目按钮触发
     */
    relationProject(projectId, projctName) {
      var selected2 = this.selected1
      var flag = true
      // 判断勾选的结果是否已经关联了选中的项目
      for (var i = 0; i < selected2.length; i++) {
        var flag = true
        if (selected2[i].projectName) {
          var m = selected2[i].projectName.split(',')
          for (var j = 0; j < m.length; j++) {
            if (m[j] == projctName) {
              flag = false
              break
            }
          }
        }
      }
      if (selected2.length == 0) {
        alert('请选择运行结果')
      } else if (flag == false) {
        alert('选中的运行结果中，存在已关联该项目的结果')
      } else {
        var resultRelPro = []
        for (var i = 0; i < selected2.length; i++) {
          var resultRelProject = {
            runTaskRelUuid: selected2[i].runTaskRelUuid,
            projectUuid: projectId,
            projectName: projctName
          }
          resultRelPro.push(resultRelProject)
        }
        ResultRelProject(resultRelPro).then((resp) => {
          if (resp.data == true) {
            this.getLikeList()
            this.$message({
              type: 'success',
              message: '关联成功!'
            })
          } else {
            this.$message({
              type: 'error',
              message: '关联失败!'
            })
          }
        })
      }
    },
    /**
     * 移除项目关联
     */
    RemoverelationProject(resultRelProjectUuid) {
      rmResultRelProjectlr(resultRelProjectUuid).then((resp) => {
        if (resp.data == true) {
          this.getLikeList()
          this.$message({
            type: 'success',
            message: '取消关联成功!'
          })
        } else {
          this.$message({
            type: 'error',
            message: '取消关联失败!'
          })
        }
      })
    },
    /**
     * 结果共享
     */
    modelResultShare(runTaskRelUuid, userUuid) {
      var runResultShare = {
        runTaskRelUuid: runTaskRelUuid,
        userUuid: userUuid
      }
      insertRunResultShare(runResultShare).then((resp) => {
        if (resp.data == true) {
          this.$message({
            type: 'success',
            message: '结果共享成功!'
          })
        } else {
          this.$message({
            type: 'error',
            message: '结果共享失败!'
          })
        }
      })
    },
    /**
     * val是运行结果中的resultTables
     * modelName是选中的模型的名字
     */
    getResultTables(val, modelName, modelUuid) {
      console.log(modelUuid)
      var assistTables = []
      var mainTable = null
      for (var i = 0; i < val.length; i++) {
        if (val[i].tableType == 1) {
          mainTable = val[i]
        } else {
          assistTables.push(val[i])
        }
      }
      // 触发父类方法addTab在index.vue界面，同时穿过三个参数assistTables：辅表（运行结果表）数组  mainTable：主表（运行结果表对象）
      // modelName：模型的名称，用来给新页签赋值title属性用
      this.$emit('addtab', assistTables, mainTable, modelName, modelUuid)
    }
  }
}
</script>


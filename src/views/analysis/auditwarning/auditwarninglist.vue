<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList"/>
    </div>
    <el-row>
      <el-col align="right">
        <el-button type="primary" class="oper-btn add" @click="add"/>
        <el-button type="primary" class="oper-btn edit" @click="update" :disabled="!isShowSingleBtn"/>
        <el-button type="primary" class="oper-btn delete" @click="deleteWarning" :disabled="!isShowManyBtn"/>
        <el-button type="primary"  class="oper-btn online" @click="startWarnings" :disabled="!isStartBtn" />
        <el-button type="primary"  class="oper-btn offline" @click="stopWarnings" :disabled="!isStopBtn" />
      </el-col>
    </el-row>
    <el-table :key="tableKey" ref="auditWarningList" v-loading="listLoading" :data="list" border fit
              highlight-current-row style="width: 100%;" stripe
              @select="listSelectChange" @select-all="listSelectChange" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="预警名称" prop="warningName" width="300px">
        <template slot-scope="scope">
          <el-link
              @click.native.prevent="detail(scope.row.auditWarningUuid)"
              type="primary">
            {{ scope.row.warningName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createUserName" width="150px"/>
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" align="center"/>
      <el-table-column label="关联类型" prop="warningType" :formatter="warningTypeFormat" align="center"/>
      <el-table-column label="关联模型" prop="sourceCount"/>
      <el-table-column label="状态" prop="isStart" align="center" >
        <template slot-scope="scope">
          <div
              type="primary"
              v-if="scope.row.isStart == 0"
          >
            停用
          </div>
          <div
              type="primary"
              v-if="scope.row.isStart == 1">
            启用
          </div>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize"
                @pagination="getList"/>
    <el-dialog :title="editDialogTitle" v-if='editDialogVisible' :close-on-click-modal="false"
               :visible.sync="editDialogVisible">
      <EditAuditWarning ref="edit" :option="operationObj.option" :optionUuid="operationObj.optionUuid"
                        :userInfo="userInfo"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">关闭</el-button>
        <el-button type="primary" v-show="operationObj.option === 'add' || operationObj.option === 'update'"
                   @click="save">保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { findAuditWarningList, addWarning, deleteAuditWarning, updateWarning, startById, stopById, judgeName, startByIds, stopByIds} from '@/api/analysis/auditwarning'
import QueryField from '@/components/public/query-field/index'
import Pagination from '@/components/Pagination/index'
import EditAuditWarning from '@/views/analysis/auditwarning/editauditwarning'
import { getInfo } from '@/api/user';
export default {
  name: 'auditWarningList',
  components: {Pagination, QueryField, EditAuditWarning},
  data() {
    return {
      //表格id
      tableKey: 'auditWarningTable',
      //表格数据
      list: null,
      //查询总数
      total: 0,
      //列表遮罩
      listLoading: false,
      //是否展示修改等单个数据操作按钮
      isShowSingleBtn: false,
      //是否展示删除等多个数据操作按钮
      isShowManyBtn: false,
      // 是否禁用启用或停用按钮(禁用：false)
      isStartBtn: false,
      isStopBtn: false,
      //编辑审计预警dialog标题
      editDialogTitle: "添加审计预警",
      //编辑审计预警dialog是否展现
      editDialogVisible: false,
      //查询条件
      queryFields: [
        {label: '预警名称', name: 'warningName', type: 'fuzzyText', value: ''},
        {label: '创建人', name: 'createUserName', type: 'fuzzyText'},
        { label: '创建日期', name: 'createTime', type: 'timePeriod' },
        { label: '启用状态', name: 'isStart', type: 'select' ,
          data: [{ name: '停用', value: '0' }, { name: '启用', value: '1' }] },
      ],
      //新增，编辑，详情操作参数
      operationObj: {
        //操作类型 add添加 update修改 detail详情
        option: "add",
        //操作数据主键
        optionUuid: "",
        //保存结果文件夹名称
        // locationName : ""
      },
      //分页查询条件
      pageQuery: {
        //分页查询条件对象
        condition: {},
        //查询页数
        pageNo: 1,
        //每页显示多少条
        pageSize: 20
      },
      // //当前页面的用户信息
      // userInfo: ''
        //当前页面的用户信息
        userInfo:[],
      selections:[]
    }
  },
  computed: {},
  created() {
    this.getList()
    //获取当前用户
    getInfo().then((resp) => {
      this.userInfo[0] = resp.data;
    });
  },
  methods: {

    /**
     * 启动预警
     * @param id 审计预警主键
     */
    startWarning(id) {
      if (!id) {
        this.$message({
          type: 'info',
          message: '请先选择要启动的预警!'
        })
        return
      }
      startById(id).then(resp => {
        if (resp.code !== 0) {
          this.$message({
            type: 'error',
            message: '启动预警失败'
          })
          return
        }
        this.$notify({
          title: '提示',
          message: '启动成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        });
        this.getList()
      })
    },
    /**
     * 停止预警
     * @param id 审计预警主键
     */
    stopWarning(id) {
      if (!id) {
        this.$message({
          type: 'info',
          message: '请先选择要停止的预警!'
        })
        return
      }
      stopById(id).then(resp => {
        if (resp.code !== 0) {
          this.$message({
            type: 'error',
            message: '停止预警失败'
          })
          return
        }
        this.$notify({
          title: '提示',
          message: '停止成功',
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        });
        this.getList()
      })
    },
    /**
     * 启动预警
     * @param id 审计预警主键
     */
    startWarnings(){
      var ids = [];
      this.selections.forEach((r, i) => {
        ids.push(r.auditWarningUuid);
      })
      if(ids.length == 0){
        this.$message({
          type: 'info',
          message: '请先选择要启动的预警!'
        })
        return
      }
      var idsStr = ids.join(',');
      startByIds(idsStr).then(resp =>{
        if(resp.code !== 0){
          this.$message({
            type: 'error',
            message: '批量启动预警失败'
          })
          return
        }
        this.$notify({
          title:'提示',
          message:'批量启动预警成功',
          type:'success',
          duration:2000,
          position:'bottom-right'
        });
        this.getList()
      })
    },
    /**
     * 停止预警
     * @param id 审计预警主键
     */
    stopWarnings(id){
      var ids = [];
      this.selections.forEach((r, i) => {
        ids.push(r.auditWarningUuid);
      })
      if(ids.length == 0){
        this.$message({
          type: 'info',
          message: '请先选择要停用的预警!'
        })
        return
      }
      var idsStr = ids.join(',');
      stopByIds(idsStr).then(resp => {
        if(resp.code !== 0){
          this.$message({
            type: 'error',
            message: '停止预警失败'
          })
          return
        }
        this.$notify({
          title:'提示',
          message:'停止成功',
          type:'success',
          duration:2000,
          position:'bottom-right'
        });
        this.getList()
      })
    },
    /**
     * 列选择触发事件
     * @param selection 已选择行
     */
    listSelectChange(selection) {
      if (selection && selection.length == 0) {
        this.isShowManyBtn = false
        this.isShowSingleBtn = false
        this.isStopBtn = false
        this.isStartBtn = false
      }
      if (selection && selection.length > 0) {
        this.isShowManyBtn = true
      }
      if (selection && selection.length == 1) {
        this.isShowSingleBtn = true
        if(selection[0].isStart == 1){
          this.isStopBtn = true
        }else {
          this.isStartBtn = true
        }
      }
      if (selection && selection.length > 1) {
        this.isShowSingleBtn = false
        this.isShowManyBtn = true
        // 如果选中的预警状态不统一，启用停用按钮全部禁用
        let isDisBtn;
        for(let obj of selection){
          if(obj.isStart != isDisBtn){
            this.isStartBtn = false
            this.isStopBtn = false
          }else{
            isDisBtn = obj.isStart
          }
        }
      }

    },
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
    dateFormatter(row, column) {
      const datetime = row.createTime
      if (datetime) {
        var dateMat = new Date(datetime)
        var year = dateMat.getFullYear()
        var month = dateMat.getMonth() + 1
        var day = dateMat.getDate()
        var hh = dateMat.getHours()
        var mm = dateMat.getMinutes()
        var ss = dateMat.getSeconds()
        var timeFormat = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
        return timeFormat
      }
      return ''
    },

    /**
     * 获取审计预警列表
     * @param query 查询条件
     */
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
      }
      findAuditWarningList(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },

    /**
     * 新增审计预警
     */
    add() {
      this.operationObj.option = "add"
      this.editDialogTitle = "添加审计预警"
      this.editDialogVisible = true
    },

    /**
     * 更新审计预警
     */
    update() {
      let selectObj = this.$refs.auditWarningList.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({type: 'info', message: '请先选择要修改的审计预警!'})
        return
      }
      this.operationObj.option = "update"
      this.operationObj.optionUuid = selectObj[0].auditWarningUuid
      this.editDialogTitle = "修改审计预警"
      this.editDialogVisible = true
    },

    /**
     * 查看审计预警
     */
    detail(id, locaname) {
      this.operationObj.option = "detail"
      this.operationObj.optionUuid = id
      this.editDialogTitle = "审计预警详情"
      this.editDialogVisible = true
      // this.operationObj.locationName = locaname
      // console.log(locaname+"111")
    },

    /**
     * 删除审计预警
     */
    deleteWarning(id) {
      let selectObj = this.$refs.auditWarningList.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({type: 'info', message: '请先选择要删除的审计预警!'})
        return
      }
      //组织删除审计预警
      let deleteObj = []
      for (let obj of selectObj) {
        if (!obj) {
          continue
        }
        deleteObj.push({
          auditWarningUuid: obj.auditWarningUuid,
          warningName: obj.warningName,
          isDeleted: obj.isDeleted
        })
      }
      this.$confirm('确定删除选中的审计预警信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //删除审计预警信息
        deleteAuditWarning(deleteObj).then(resp => {
          if (resp.code !== 0) {
            this.$message({
              type: 'error',
              message: '删除失败'
            })
            return
          }
          this.$notify({
            title: '提示',
            message: '删除成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.getList()
        })
      })
    },

    /**
     * 保存审计预警调用
     */
    save: function () {
      let fromData = this.$refs['edit'].getFormData()
      if (!fromData) {
        return
      }
      //新增
      if (this.operationObj.option == "add") {
        //获取表单数据中的模型列表
        var editModelListAdd = this.$refs['edit'].temp.modelList;

        var nameList = [];
        //遍历模型列表
        for (var i in editModelListAdd) {
          var addTbName = editModelListAdd[i].warningResTbName;
          if (addTbName == null || addTbName == "") {
            this.$message.warning("模型运行结果名不可为空！");
            return;
          }
          for (var i in nameList){
            if (nameList[i] == addTbName){
              this.$message.warning("模型运行结果名'"+addTbName+"'重复！请修改后保存");
              return;
            }
          }
          //将填入的模型运行结果名赋值给list
          nameList.push(addTbName);
        }
        //判断模型结果名是否存在 返回""证明不存在，返回其他字符串证明存在，且字符串本身为结果名
        judgeName(nameList).then(re => {
            //遍历模型列表
            for (var addItem in re.data) {
              var addWarResTbName = re.data[addItem];
              //将填入的模型运行结果名赋值给formData
              fromData.warningTaskRel[addItem].warningResTbName = addWarResTbName;
            }
            addWarning(fromData).then(resp => {
              if (resp.code != 0) {
                this.$message({
                  type: 'error',
                  message: '保存预警信息失败!'
                })
                return
              }

              this.$notify({
                title: '提示',
                message: '保存预警信息成功!',
                type: 'success',
                duration: 2000,
                position: 'bottom-right'
              })
              this.editDialogVisible = false
              this.getList()
            })
        })
      } else if (this.operationObj.option == "update") {
        //获取表单数据中的模型列表
        var editModelListUpdate = this.$refs['edit'].temp.modelList;

        var nameListU = [];
        //遍历模型列表
        for (var j in editModelListUpdate) {
          var addTbNameU = editModelListUpdate[j].warningResTbName;
          if (addTbNameU == null || addTbNameU == "") {
            this.$message.warning("模型运行结果名不可为空！");
            return;
          }
          for (var i in nameListU){
            if (nameListU[i] == addTbNameU){
              this.$message.warning("模型运行结果名'"+addTbNameU+"'重复！请修改后保存");
              return;
            }
          }
          //将填入的模型运行结果名赋值给list
          nameListU.push(addTbNameU);
        }
        //判断模型结果名是否存在 返回""证明不存在，返回其他字符串证明存在，且字符串本身为结果名
        judgeName(nameListU).then(re => {
          // var result = re.data;
          // //并且不存在原结果表名
          // var ifExists = nameListU.indexOf(result);
          // if (result != "" && ifExists == -1) {
          //   this.$message.warning("模型运行结果名：" + result + " 已存在，请重新输入！");
          //   return;
          // } else {
            //遍历模型列表
            for (var updateItem in editModelListUpdate) {
              var updateWarResTbName = editModelListUpdate[updateItem].warningResTbName;
              //将填入的模型运行结果名赋值给formData
              fromData.warningTaskRel[updateItem].warningResTbName = updateWarResTbName;
            }
            updateWarning(fromData).then(resp => {
              if (resp.code != 0) {
                this.$message({
                  type: 'error',
                  message: '保存预警信息失败!'
                })
                return
              }
              this.$notify({
                title: '提示',
                message: '保存预警信息成功!',
                type: 'success',
                duration: 2000,
                position: 'bottom-right'
              })
              this.editDialogVisible = false
              this.getList()
            })
          // }
        })
      }
    },

    /**
     * 审计预警关联类型格式化
     */
    warningTypeFormat(row, column) {
      let warningType = {
        1: "模型",
        2: "指标"
      }
      return warningType[row.warningType]
    },

    handleSelectionChange(val) {
      this.selections = val
    }
  }
}
</script>

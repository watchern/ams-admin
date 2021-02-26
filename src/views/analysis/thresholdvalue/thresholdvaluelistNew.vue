<template>
  <div class="tree-list-container all">
    <div class="filter-container">
      <QueryField ref="queryfield" :form-data="queryFields" @submit="getList" />
    </div>
    <el-row type="flex" class="row-bg">
      <el-col align="right">
        <el-button type="primary" :disabled="btnState.addBtnState" class="oper-btn add-1" @click="addThreshValue" />
        <el-button type="primary" :disabled="btnState.editBtnState" title="修改阈值" class="oper-btn edit-2" @click="updateThresholdValue" />
        <el-button type="primary" :disabled="btnState.deleteBtnState" titl="删除阈值" class="oper-btn delete-6" @click="deleteThresholdValue" />
        <el-dropdown placement="bottom" trigger="click" class="el-dropdown">
          <el-button type="primary" :disabled="btnState.otherBtn" class="oper-btn more" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="">发布</el-dropdown-item>
            <el-dropdown-item @click.native="">撤销发布</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <el-table
      :key="tableKey"
      ref="modelListTable"
      v-loading="listLoading"
      style="height: 450px;overflow-y: scroll"
      :data="list"
      border
      fit
      highlight-current-row
      @select="thresholdvalueTableSelectEvent"
      @select-all="thresholdvalueTableSelectEvent"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="阈值名称" width="300px" prop="thresholdValueFolderName">
        <template slot-scope="scope">
          <el-link type="primary" @click="selectModelDetail(scope.row.thresholdValueUuid)">{{ scope.row.thresholdValueName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="阈值类型" width="150px" align="center" prop="thresholdValueType" :formatter="threshTypeFormatter" />
      <el-table-column label="创建人" prop="createUserName" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" :formatter="dateFormatter"/>
    </el-table>
    <Pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
    <el-dialog width="40%" :close-on-click-modal="false" v-if="dialogFormVisibleEdit" :title="editThresholdValueTitle" :visible.sync="dialogFormVisibleEdit" :append-to-body="true">
      <EditThresholdValue ref="EditThresholdValue" :operationObj="operationObj" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">关闭</el-button>
        <el-button type="primary" @click="getSaveObj">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
import {findThresholdValueList,addThresholdValue,batchThresholdValueDel,findThresholdValueById,updateThresholdValue} from '@/api/analysis/thresholdvalue'
import EditThresholdValue from '@/views/analysis/thresholdvalue/editthresholdvalue'
export default {
  name: 'Thresholdvaluelist',
  components: { QueryField,Pagination,EditThresholdValue },
  data() {
    return {
      tableKey: 'errorUuid',
      // list列表
      list: null,
      total: 0,
      // 遮罩
      listLoading: false,
      // 新增或编辑阈值dialog
      dialogFormVisibleEdit: false,
      // 折叠面板默认展开
      activeNames: ['1', '2'],
      // 编辑模型dialog
      editModelShow: false,
      // 发布模型
      publicModelValue: 'publicModel',
      // 选中树节点
      selectTreeNode: null,
      // 编辑模型遮罩
      editorModelLoading: false,
      // 是否修改
      isUpdate: false,
      // 按钮状态
      btnState: {
        addBtnState: false,
        editBtnState: true,
        deleteBtnState: true,
        previewBtn: true,
        otherBtn: true
      },
      queryFields: [
        { label: '阈值名称', name: 'thresholdValueName', type: 'fuzzyText', value: ''},
        { label: '阈值类型', name: 'thresholdValueType', type: 'select',
          data: [{ name: '单值', value:1}, { name: '多值', value:2 }],
          default: '-1' }
      ],
      // 是否编辑模型对象
      operationObj: {},
      formStyle: {
        width: '700px',
        height: '400px'
      },
      temp: {
        thresholdValueUuid: '',
        thresholdValueName: '',
        thresholdValueType: '',
        thresholdValueMemo: '',
      },
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20
      },
      editThresholdValueTitle:''
    }
  },
  computed: {

  },
  created() {
    // this.getList({ modelFolderUuid: 1 })
  },
  mounted() {

  },
  methods: {
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
    dateFormatter(row, column) {
      const datetime = row.createTime
      if (datetime) {
        let dateMat = new Date(datetime)
        let year = dateMat.getFullYear()
        let month = dateMat.getMonth() + 1
        let day = dateMat.getDate()
        let hours = dateMat.getHours()
        let minutes = dateMat.getMinutes()
        let second = dateMat.getSeconds()
        if (month.toString().length == 1) {
          month = "0" + month
        }
        if (day.toString().length == 1) {
          day = "0" + day
        }
        if (hours.toString().length == 1) {
          hours = "0" + hours
        }
        if (minutes.toString().length == 1) {
          minutes = "0" + minutes
        }
        if(second.toString().length == 1){
          second = "0" + second
        }
        var d = year + "-" + month + "-" + day + " " + hours + ":" + minutes+ ":" + second;
        return d;
      }
    },
    threshTypeFormatter(row, column){
      if(row.thresholdValueType === 1){
        return "单值"
      }
      if(row.thresholdValueType === 2){
        return "多值"
      }
    },
    /**
     * 获取模型列表
     * @param query 查询条件
     */
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
        if(this.selectTreeNode != null){
          query.thresholdValueFolderUuid = this.selectTreeNode.id
        }
      }
      findThresholdValueList(this.pageQuery).then(resp => {
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    /**
     * 设置选中的树节点
     * @param data 树节点
     */
    setSelectTreeNode(data) {
      this.selectTreeNode = data
    },
    /**
     * 重置查询
     */
    resetQuery() {
      this.query = {
        condition: {
          opIp: '',
          moduleName: '',
          opOperate: '',
          opInfo: '',
          endTime: '',
          opTime: '',
          opUserName: ''
        }
      }
    },
    /**
     *
     */
    thresholdvalueTableSelectEvent(selection, row) {
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj.length == 1) {
        // 显示全部按钮
        this.btnState.otherBtn = false
        this.btnState.deleteBtnState = false
        this.btnState.addBtnState = false
        this.btnState.editBtnState = false
      } else if (selectObj.length > 1) {
        // 只显示删除和添加按钮
        this.btnState.otherBtn = false
        this.btnState.deleteBtnState = false
        this.btnState.addBtnState = false
        this.btnState.editBtnState = true
        this.btnState.previewBtn = true
        this.isShowShoppingCart = true
      } else if (selectObj.length == 0) {
        // 只显示添加按钮
        this.btnState.otherBtn = true
        this.btnState.deleteBtnState = true
        this.btnState.addBtnState = false
        this.btnState.editBtnState = true
      }
    },
    /**
     * 添加阈值
     */
    addThreshValue() {
      this.editThresholdValueTitle = "添加阈值"
      this.isUpdate = false
      this.operationObj = { operationType: 1, folderId: null, folderName: null}
      if (this.selectTreeNode != null) {
        if (this.selectTreeNode.pid == 0 || this.selectTreeNode.pid == null) {
          this.$message({ type: 'info', message: '不允许建立在根目录' })
          return
        }
        this.operationObj = { operationType: 1, folderId: this.selectTreeNode.id, folderName: this.selectTreeNode.label }
      }
      this.dialogFormVisibleEdit = true
    },
    /**
     *修改阈值
     */
    updateThresholdValue() {
      this.isUpdate = true
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj.length == 0) {
        this.$message({ type: 'info', message: '最少选择一个阈值!' })
        return
      }
      if (selectObj.length > 1) {
        this.$message({ type: 'info', message: '只能选择一个阈值!' })
        return
      }
      this.editThresholdValueTitle = '修改阈值'
      this.$emit('loadingSet',true,"正在获取阈值信息...");
      findThresholdValueById(selectObj[0].thresholdValueUuid).then(result => {
        this.$emit('loadingSet',false,"");
        if (result.code == 0) {
           this.operationObj = {
            operationType: 2,
            thresholdValue: result.data,
            folderId: '',
            folderName: ''
          }
          this.dialogFormVisibleEdit = true
        } else {
          this.$message({ type: 'error', message: '修改失败' })
        }
      }).catch(reason => {
        this.$emit('loadingSet',false,"");
      })
    },
    /**
     * 删除模型
     */
    deleteThresholdValue() {
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要删除的阈值!' })
        return
      }
      this.$confirm('此操作将永久删除该阈值, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchThresholdValueDel(selectObj).then(result => {
          if (result.code == 0) {
            this.getList(this.query)
            this.$emit('refreshTree')
            this.$notify({
              title: '提示',
              message: '删除成功',
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          } else {
            this.$message({ type: 'error', message: '删除失败' })
          }
        })
      })
    },
    /**
     * 发布阈值
     */
    publicThresholdValue(value) {
      if (this.selectTreeNode == null || this.selectTreeNode.path.indexOf('gonggong') != -1) {
        this.$message({ type: 'info', message: '只能发布非公共阈值下的阈值' })
        return
      }
      this.publicModelValue = value
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要发布的阈值!' })
        return
      }
      this.treeSelectShow = true
    },
    /**
     *撤销发布
     */
    cancelThresholdValue() {
      if (this.selectTreeNode == null || this.selectTreeNode.path.indexOf('gonggong') == -1) {
        this.$message({ type: 'info', message: '只能撤销公共阈值下的阈值' })
        return
      }
      var selectObj = this.$refs.modelListTable.selection
      if (selectObj == undefined || selectObj.length === 0) {
        this.$message({ type: 'info', message: '请先选择要撤销发布的阈值!' })
        return
      }
      this.$confirm('是否确定将选中的阈值撤销发布?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

      }).catch(() => {

      })
    },
    /**
     * 修改要发布的模型
     */
    updatePublicModel() {
      this.$confirm('是否确定将选中的模型发布到公共模型下?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const selectNode = this.$refs.modelFolderTree.getSelectNode()
        var selectObj = this.$refs.modelListTable.selection
        for (let i = 0; i < selectObj.length; i++) {
          selectObj[i].modelFolderUuid = selectNode.id
        }
        this.updateModelBasicInfo(selectObj, '发布')
      })
    },
    /**
     * 修改模型基本信息
     * @param selectObj 要修改的数组对象
     * @param tips 提示信息
     */
    updateModelBasicInfo(selectObj, tips) {
      updateModelBasicInfo(selectObj).then(result => {
        if (result.code == 0) {
          this.treeSelectShow = false
          this.$notify({
            title: '提示',
            message: tips + '成功',
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.getList(this.query)// 刷新列表
          this.$emit('refreshTree')
          // 刷新树和列表
        } else {
          this.$message({ type: 'error', message: tips + '失败' })
        }
      })
    },
    getSaveObj(){
      let threshValueObj = this.$refs.EditThresholdValue.getSaveObj()
      if(!threshValueObj){
        return
      }
      else{
        if(!this.isUpdate){
          addThresholdValue(threshValueObj).then(result=>{
            if(result.data){
              //关闭窗口
              this.dialogFormVisibleEdit = false
              //刷新列表
              this.getList(this.query)
              this.$emit('refreshTree')
            }
            else{
              this.$message({ type: 'error', message:'阈值添加失败' })
            }
          })
        }else{
          updateThresholdValue(threshValueObj).then(result=>{
            if(result.data){
              //关闭窗口
              this.dialogFormVisibleEdit = false
              //刷新列表
              this.getList(this.query)
              this.$emit('refreshTree')
            }
            else{
              this.$message({ type: 'error', message:'阈值修改失败' })
            }
          })
        }
      }
    }
  }
}
</script>

<style scoped>

.el-dropdown{
  margin-left: 10px;
}

.panel-font-size{
  font-size: 25px;
}

.item-y{
  position: fixed;
  top: 15%;
  left: 45%;
  background: #FFFFFF;
  box-shadow: 0 0 9px 0 rgba(0,0,0,0.15);
  border-radius: 13.5px;
  border-radius: 13px;
  width: 800px;
  /* height: 130px; */
  z-index: 10;
}
.content-y{
  margin: -52px 0 0 0;
  height: 650px;
  width: 100%;
}
.btn-show{
  position: absolute;
  top: 3px;
  right: 32px;
  z-index: 3;
}
.btn-show1{
  position: absolute;
  top: 135px;
  right: 330px;
  z-index: 3;
  width: 203px;
  height: 44px;
  border-radius: 21.6px;
  font-size: 14.4;
}
.icon-search{
  position: absolute;
  top: 150px;
  right: 385px;
  z-index: 4;
  font-size: 14.4px;
  color: #c8ff8c;
}
.row-all{
  height: 650px;
  overflow: auto;
}
.table{
  height: 450px !important;
}

</style>

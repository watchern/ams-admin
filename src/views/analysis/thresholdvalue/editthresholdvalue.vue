<template>
  <div class="app-container" v-loading="loading" :element-loading-text="loadText">
    <el-container class="el-container">
      <div class="detail-form">
        <el-form :model="thresholdValue"  ref="basicInfoForm" :rules="basicInfoRules" :disabled="isFormEdit">
          <el-row>
            <el-col :span="23">
              <el-form-item label="阈值名称" prop="thresholdValueName">
                <el-input v-model="thresholdValue.thresholdValueName"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="23">
                <el-form-item label="阈值类型" prop="thresholdValueType">
                  <el-select v-model="thresholdValue.thresholdValueType" style="width:100%" placeholder="请选择" @change="onSelectChange">
                    <el-option :key="1" label="单值" :value="1"></el-option>
                    <el-option :key="2" label="多值" :value="2"></el-option>
                  </el-select>
                </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="阈值分类" prop="thresholdValueFolderName">
              <el-col :span="19">
                <el-input v-model="thresholdValue.thresholdValueFolderUuid" style="display: none" :disabled="true"/>
                <el-input v-model="thresholdValue.thresholdValueFolderName" :disabled="true"/>
              </el-col>
              <el-col :span="2" v-if="!isFormEdit"  :offset="1">
                <el-button type="primary" @click.prevent="openFolderTreeDialog">设置</el-button>
              </el-col>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="阈值说明" prop="thresholdValueMemo">
                <el-input type="textarea" v-model="thresholdValue.thresholdValueMemo"/>
              </el-form-item>
            </el-col>
          </el-row>
          <div ref="threshValueSet">
            <el-button style="float: right" v-show="isShow.threshValueInfoSetIsShow" @click="addThreshValueInfo">新增</el-button>
            <el-table ref="columnData" :data="thresholdValue.thresholdValueInfoList" class="div-width" v-show="isShow.threshValueInfoSetIsShow">
              <el-table-column prop="filterConditions" label="阈值对象" width="275">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.filterConditions" placeholder="请输入阈值对象名称" :disabled="isBanEdit"/>
                </template>
              </el-table-column>
              <el-table-column prop="filterValueOne" label="值" width="200">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.filterValue" placeholder="请输入值" :disabled="isBanEdit"/>
                </template>
              </el-table-column>
              <el-table-column prop="" label="操作" width="100">
                <template slot-scope="scope">
                  <el-button @click.native.prevent="deleteRowData(scope.$index, thresholdValue.thresholdValueInfoList)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-form-item label="值" prop="filterValue" v-show="isShow.threshValueIsShow">
              <el-input v-model="thresholdValue.filterValue"/>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-container>
    <el-dialog width="40%" :close-on-click-modal="false" v-if="folderTreeDialog" title="请选择阈值分类" :visible.sync="folderTreeDialog" :append-to-body="true">
      <Thresholdvaluetree ref="Thresholdvaluetree" style="height: 500px" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="folderTreeDialog = false">关闭</el-button>
        <el-button type="primary" @click="getFolderTreeObj">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Thresholdvaluetree from '@/views/analysis/thresholdvalue/thresholdvaluetree'
export default {
  name:'EditThresholdValue',
  props:['operationObj'],
  components: { Thresholdvaluetree },
  computed:{
  },
  data() {
    return {
      //实体对象
      thresholdValue:{
        thresholdValueUuid:'',
        thresholdValueName:'',
        thresholdValueType:null,
        thresholdValueMemo:'',
        thresholdValueFolderUuid:'',
        thresholdValueFolderName:'',
        filterValue:'',
        thresholdValueInfoList:[],
        isDeleted:0
      },
      //界面元素是否显示
      isShow:{
        threshValueInfoSetIsShow:false,
        threshValueIsShow:true
      },
      //是否禁止编辑
      isBanEdit:false,
      isFormEdit:false,
      //文件夹dialog
      folderTreeDialog:false,
      //遮罩层
      loading:false,
      //遮罩层文字
      loadText:'',
      basicInfoRules: {
        thresholdValueName: [
          {type: 'string', required: true, message: '请输入阈值名称', trigger: 'blur'}
        ],
        thresholdValueFolderName: [
          {required: true, message: '请选择阈值分类', trigger: 'blur'}
        ],
        filterValue: [{type: 'string', validator:this.verValueMethods}
        ]
      },
    }
  },
  created() {

  },
  mounted() {
    if(this.operationObj.operationType === 1){
      //新增
      if(this.operationObj.folderId){
        //反显id
        this.thresholdValue.thresholdValueFolderUuid = this.operationObj.folderId
        this.thresholdValue.thresholdValueFolderName = this.operationObj.folderName
      }
    }
    if(this.operationObj.operationType === 2){
      this.thresholdValue = this.operationObj.thresholdValue
      this.onSelectChange(this.thresholdValue.thresholdValueType)
    }
    else{
      //修改
    }
    /*详情*/
    if(this.operationObj.operationType === 3) {
      this.thresholdValue = this.operationObj.thresholdValue
      this.isBanEdit = true;
      this.isFormEdit = true;
    }
  },
  methods: {
    /**
     *select值改变事件
     */
    onSelectChange(value){
      if(value === 1){
        this.isShow.threshValueIsShow = true
        this.isShow.threshValueInfoSetIsShow = false
      }
      if(value === 2){
        this.isShow.threshValueIsShow = false
        this.isShow.threshValueInfoSetIsShow = true
      }
    },
    /**
     * 打开文件夹dialog
     */
    openFolderTreeDialog(){
      this.folderTreeDialog = true
    },
    verValueMethods(rule, value, callback){
      if(this.thresholdValue.thresholdValueType === 1){
        if(value === ""){
          callback(new Error('请输入值'))
        }
        else{
          callback()
        }
      }
      if(this.thresholdValue.thresholdValueType === 2){
        if(this.thresholdValue.thresholdValueInfoList.length === 0){
          this.$message({type:'info',message:'最少输入一个阈值对象和值'})
        }
        else{
          //不为0时则校验里面的数据是否为空
          let verResult = true
          for(let i = 0;i < this.thresholdValue.thresholdValueInfoList.length;i++){
            let filterValue = this.thresholdValue.thresholdValueInfoList[i].filterValue
            let filterConditions = this.thresholdValue.thresholdValueInfoList[i].filterConditions
            if(!filterConditions || !filterValue){
              this.$message({type:'info',message:'阈值对象或值不能为空'})
              verResult = false
              break
            }
          }
          if(verResult){
            callback()
          }
        }
      }
    },
    /**
     *获取文件夹对象
     */
    getFolderTreeObj(){
      let treeObj = this.$refs.Thresholdvaluetree.getSelectNode()
      this.thresholdValue.thresholdValueFolderUuid = treeObj.id
      this.thresholdValue.thresholdValueFolderName = treeObj.label
      this.folderTreeDialog = false
    },
    /**
     * 添加阈值信息
     */
    addThreshValueInfo(){
      this.thresholdValue.thresholdValueInfoList.push({})
    },
    getSaveObj(){
      let verResult = false
      this.$refs['basicInfoForm'].validate((valid) => {
        if (valid) {
          verResult = true
        } else {
          return false;
        }
      });
      if(verResult){
        return this.thresholdValue
      }
    },
    deleteRowData(index,rows){
      rows.splice(index, 1)
    }
  }
}
</script>

<style scoped>

</style>

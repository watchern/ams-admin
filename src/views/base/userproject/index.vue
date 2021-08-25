<template>
  <div>
    <span class="el-form-item__label">项目名称:</span><el-input class="detail-form" style="width: 200px;" v-model="filterprojectName" placeholder="请输入内容"></el-input>
    <el-table  style="height: 400px;overflow-y: scroll"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="项目名称"
        width="200px"
        align="center"
        prop="prjName"
      />
      <el-table-column
        label="创建人名称"
        width="150px"
        align="center"
        prop="createPersonName"
      />
      <el-table-column
        label="创建时间"
        width="200px"
        align="center"
        prop="createTime"
      />
    </el-table>
  </div>
</template>
<script>
import { getProjectByLoginUserUuid } from "@/api/base/userproject";
import {getProjects} from "@/api/analysis/auditmodelresult";
export default {
  watch:{
    filterprojectName(val){
      if (val!==''){
        this.list = []
        for (var i =0;i< this.datas.length;i++){
          if (this.datas[i].prjName.indexOf(val) !== -1){
            this.list.push(this.datas[i])
          }
        }
      }else {
        this.list = this.datas
      }
    }
  },
  created() {
    // this.getProject();
    this.getAllPrj();
  },
  data() {
    return {
      listLoading: true,
      list: [],
      selectValue: {},
      filterprojectName:'' ,//存储选择关联项目时过滤项目的名称
      datas:[]   //存储该人的所有项目
    };
  },
  methods: {
    getProject() {
      getProjectByLoginUserUuid().then((resp) => {
        this.datas = resp.data
        this.list = resp.data;
        this.listLoading = false;
      });
    },
    /**
     * 获取项目列表
     **/
    getAllPrj(){
      getProjects().then((resp) => {
        this.datas = resp.data
        this.list = resp.data;
        this.listLoading = false;
      });
    },
    /**
     * 当多选框改变时触发
     */
    handleSelectionChange(val) {
      this.selectValue = val;
    },
    /**
     * 返回选中的数据方法
     */
    getSelectValue() {
      return this.selectValue;
    }
  },
};
</script>

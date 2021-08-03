<template>
  <div>
    <!-- <el-dialog
      :title="'问题复核'"
      :show-close="false"
      :visible.sync="problemdialog"
      width="60%"
    >
      <div>
        <el-form
          ref="form"
          :model="form"
          label-width="80px"
          class="detail-form"
          width="80%"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题名称">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="问题来源">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="项目名称">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否重要">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="审计人员">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发现问题时间">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题分类">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-table :data="tableData1" style="width: 100%">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column prop="date" label="日期" width="180">
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="180">
            </el-table-column>
            <el-table-column prop="address" label="地址"> </el-table-column>
          </el-table>
          <el-table :data="tableData2" style="width: 100%">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column prop="date" label="日期" width="180">
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="180">
            </el-table-column>
            <el-table-column prop="address" label="地址"> </el-table-column>
          </el-table>
          <el-row>
            <el-col :span="24">
              <el-form-item label="审批意见">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div
          style="display: flex; justify-content: center; padding-bottom: 10px"
        >
          <el-button type="primary">通过</el-button>
          <el-button type="primary">退回</el-button>
          <el-button>关闭</el-button>
        </div>
      </div>
    </el-dialog> -->
    <ProblemPopover
      ref="problempopover"
      :temp="temp"
      :dialogStatus="dialogStatus"
      :closeStatus="closeStatus"
      :disableUpdate="disableUpdate"
      @changedialogFormVisible="changedialogFormVisible"
      @refreshesParent="refreshesParent"
    />
  </div>
</template>
<script>
import ProblemPopover from "@TCB/components/ProblemPopover/index";
export default {
  props: ["appDataUuid", "applyType"],
  components:{ProblemPopover},
  data() {
    return {
      problemdialog: true,
      // 问题属性绑定
      temp: {
        problemUuid: null, // 问题UUID
        problemName: null, // 问题name
        problemSource: null, // 问题来源
        projectUuid: null, // 项目UUID
        projectName: null, // 项目name
        isImportant: null, // 是否重要
        auditPersonUuid: null, // 审计人员UUID
        auditPersonName: null, // 审计人员name
        discoveryTime: null, // 问题发现时间
        problemType: null, // 问题类型
        problemDetailsList: [], // 问题明细List
      },
      dialogStatus: "",
      textMap: {
        update: "修改问题",
        create: "新增问题",
        show: "查看问题详情",
      },
      closeStatus: false,
      disableUpdate: false,
      //   form: {
      //     name: "张某某竞技者投入年审计问题",
      //   },
      //   tableData1: [
      //     {
      //       date: "2016-05-02",
      //       name: "nnn",
      //       address: "ddd",
      //     },
      //   ],
      //   tableData2: [
      //     {
      //       date: "2016-05-02",
      //       name: "nnn",
      //       address: "ddd",
      //     },
      //   ],
    };
  },
  methods: {
    changedialogFormVisible(val) {
      this.dialogFormVisiblenew = val;
    },
    refreshesParent() {
      this.getList();
    },
  },
};
</script>
<style scoped>
</style>

<template>
  <div>
    <div class="table_header_default">
      <div style="float: left" class="title_template">
        <span class="busdatas title_font"></span>
      </div>
      <!-- <div style="float: right" class="title_template">
        <el-button type="primary" size="mini" @click="batchEditStatus"
          >批量处理</el-button
        >
      </div> -->
    </div>
    <el-table
      ref="tab"
      stripe
      :data="this.submitData.busdatas"
      @selection-change="handleSelectionChange"
      max-height="300"
    >
      <el-table-column type="selection"></el-table-column>
      <el-table-column label="模型名称" width="200px" prop="modelName">
        <template slot-scope="scope">
          <!-- <el-link
                type="primary"
                @click="selectModelDetail(scope.row.modelUuid)"
                >{{ scope.row.modelName }}</el-link
              > -->
          {{ scope.row.modelName }}
        </template>
      </el-table-column>
      <el-table-column label="平均运行时间" width="150px" prop="runTime" />
      <el-table-column label="审计事项" prop="auditItemName" />
      <el-table-column
        label="风险等级"
        prop="riskLevelUuid"
        align="center"
        :formatter="riskLevelFormatter"
      />
      <el-table-column
        label="模型类型"
        prop="modelType"
        align="center"
        :formatter="modelTypeFormatter"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
         width="150px"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        fixed="right"
        width="120"
        v-if="ifdel"
      >
        <template slot-scope="scope">
          <el-button  type="primary" @click="delsubmit(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column
        v-for="(item, index) in columnDefs"
        :key="index"
        :prop="item.field"
        :label="item.headerName"
      >
        <slot :row="item" :$index="index"></slot>
      </el-table-column>
      <el-table-column
        prop="warningStatus"
        label="预警状态"
        fixed="right"
        width="130"
      >
        <template slot-scope="scope">
          <el-select v-model="scope.row.warningStatus" placeholder="请选择">
            <el-option
              v-for="(item, i) in warningStatusOption"
              :key="i"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        prop="opinions"
        label="处理意见"
        fixed="right"
        width="150"
      >
        <template slot-scope="scope">
          <el-input
            type="input"
            :title="scope.row.opinions"
            v-model="scope.row.opinions"
          ></el-input>
        </template>
      </el-table-column> -->
    </el-table>
  </div>
</template>

<script>
import { getDictList, getOneDict } from "@/utils/index";
export default {
  props: ["flowItem", "submitData","ifdel"],
  data() {
    return {
      columnDefs: [
        { field: "modelName", headerName: "模型名称" },
        { field: "runTime", headerName: "平均运行时间" },
        { field: "auditItemName", headerName: "审计事项" },
        { field: "riskLevelUuid", headerName: "风险等级" },
        { field: "modelType", headerName: "模型类型" },
        { field: "createTime", headerName: "创建时间" },
      ],
      fileList: [],
      fileListDatas: [],
      dialogVisibleSelectStatus: false,
      multipleSelection: [],
      form: {},
      tabData: [],
      colArr: [],
      warningStatusOption: [
        // {
        //   value: "0",
        //   label: "待挂号",
        // },
        {
          value: "1",
          label: "预警发起",
        },
        {
          value: "2",
          label: "预警待查",
        },
        // {
        //   value: "3",
        //   label: "已销号",
        // },
      ],
      warningStatus: "",
    };
  },
  mounted: function () {
    //   alert("nininininiininini")
  },
  methods: {
    /**
     * 格式化时间字符串
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的时间字符串}
     */
    dateFormatter(row, column) {
      const datetime = row.createTime;
      if (datetime) {
        let dateMat = new Date(datetime);
        let year = dateMat.getFullYear();
        let month = dateMat.getMonth() + 1;
        let day = dateMat.getDate();
        let hours = dateMat.getHours();
        let minutes = dateMat.getMinutes();
        let second = dateMat.getSeconds();
        if (month.toString().length == 1) {
          month = "0" + month;
        }
        if (day.toString().length == 1) {
          day = "0" + day;
        }
        if (hours.toString().length == 1) {
          hours = "0" + hours;
        }
        if (minutes.toString().length == 1) {
          minutes = "0" + minutes;
        }
        if (second.toString().length == 1) {
          second = "0" + second;
        }
        var d =
          year +
          "-" +
          month +
          "-" +
          day +
          " " +
          hours +
          ":" +
          minutes +
          ":" +
          second;
        return d;
      }
    },
    //删除
    delsubmit(obj){

    },
    /**
     * 格式化模型类型
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    modelTypeFormatter(row, column) {
      const modelType = row.modelType;
      const dicObj = getOneDict(modelType);
      let value = "";
      if (dicObj.length == 0) {
        return "";
      }
      value = dicObj[0].codeName;
      return value;
    },
    /**
     * 格式化风险等级
     * @param row 格式化行
     * @param column 格式化列
     * @returns {返回格式化后的字符串}
     */
    riskLevelFormatter(row, column) {
      const riskLevel = row.riskLevelUuid;
      let value = "";
      const dicObj = getOneDict(riskLevel);
      if (dicObj.length == 0) {
        return "";
      }
      value = dicObj[0].codeName;
      return value;
    },
    //给表头添加背景色
    batchEditStatus() {
      if (this.multipleSelection.length == 0) {
        alert("请至少选中一条数据");
        return false;
      }
      this.dialogVisibleSelectStatus = true;
    },
    //在子组件中定义的父组件的方法
    closeSelectStatus(val) {
      this.dialogVisibleSelectStatus = false;
      for (let i = 0; i < this.multipleSelection.length; i++) {
        for (let j = 0; j < this.submitData.busdatas.length; j++) {
          if (
            this.multipleSelection[i].onlyuuid ==
            this.submitData.busdatas[j].onlyuuid
          ) {
            this.submitData.busdatas[j].warningStatus = val;
          }
        }
      }
      this.$refs.tab.clearSelection();
    },
    closeSelectStatusdialog() {
      this.dialogVisibleSelectStatus = false;
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    /**
     * 工作流  点击提交审核按钮
     */
    saveOpinion(applyTitle) {
      this.submitData.applyTitle = applyTitle;
      this.submitData.modleDataList=this.submitData.busdatas;
      // console.log("============="+JSON.stringify(this.submitData));
      this.axios
        .post("/analysis/modelPublishRelation/toSubmit", this.submitData)
        .then((response) => {
          if (response.data.code == "0") {
            this.flowItem.appDataUuid = response.data.data.modelRelationUuid;
            //修改业务执行状态为0，调用监听，执行更新流程状态操作。
            // this.$store.dispatch("applyInfo/setMstate", "0");
            this.$store.dispatch("applyInfo/setAppDataUuid", response.data.data.modelRelationUuid);
            // alert(JSON.stringify(this.$store.state.applyInfo.applyInfo))
            // alert(this.$store.state.applyInfo.applyInfo.mstate)
            // alert(response.data.data.busRelationUuid)
            this.$emit("submitFlow", response.data.data.modelRelationUuid);
            // this.flowParam = 1;
          } else {
            this.dialogVisibleSubmit = false;
            this.common.alertMsg(1, "操作失败！");
          }
        })
        .catch((error) => {
          this.dialogVisibleSubmit = false;
          this.common.alertMsg(1, "操作失败！");
          console.log(error);
        });
    },
  },
};
</script>
<style scoped>
.file_wrap {
  display: flex;
  padding: 20px 0;
}
.file_left {
  width: 150px;
}
.noEditDiv {
  padding-right: 30px;
  display: inline-block;
}
</style>
<style >
.el-table th {
  background-color: #ffffff !important;
}
.el-table tr {
  background-color: #ffffff !important;
}
.title_template {
  padding: 10px 20px 0px 20px !important;
  font-weight: 600 !important;
}
</style>
<template>
  <div>
    <div class="table_header_default">
      <div style="float: left" class="title_template">
        <span class="busdatas title_font">预警数据列表</span>
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
      <el-table-column
        v-for="(item, index) in columnDefs"
        :key="index"
        :prop="item.field"
        :label="item.headerName"
      >
        <slot :row="item" :$index="index"></slot>
      </el-table-column>
      <!-- <el-table-column
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

    <el-dialog
      title="选择预警状态"
      v-if="dialogVisibleSelectStatus"
      :visible.sync="dialogVisibleSelectStatus"
      :close-on-click-modal="false"
      width="60%"
      :modal="false"
    >
      <div>
        <selectStatus
          ref="selectStatus"
          @closeSelectStatus="closeSelectStatus"
          @closeSelectStatusdialog="closeSelectStatusdialog"
        ></selectStatus>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import selectStatus from "./reviewSelect";
export default {
  props: ["flowItem", "columnDefs", "submitData"],
  components: {
    selectStatus,
  },
  data() {
    return {
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
      // if (this.$refs.pbFile.fileListData.length != 0) {
      //   this.fileListDatas = this.$refs.pbFile.fileListData;
      // }
      this.submitData.applyTitle = applyTitle;
      this.submitData.fileInfosList = this.fileListDatas;
      this.axios
        .post("/ams-clue/tcBusRelation/toSubmit", this.submitData)
        .then((response) => {
          if (response.data.code == "0") {
            this.flowItem.appDataUuid = response.data.data.busRelationUuid;
            //修改业务执行状态为0，调用监听，执行更新流程状态操作。
            // this.$store.dispatch("applyInfo/setMstate", "0");
            // this.$store.dispatch("applyInfo/setAppDataUuid", response.data.data.busRelationUuid);
            // alert(this.$store.state.applyInfo.applyInfo.mstate)
            // alert(response.data.data.busRelationUuid)
            this.$emit("submitFlow", response.data.data.busRelationUuid);
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
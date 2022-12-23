<template>
  <div>
    <div class="table_header_default">
      <div style="float: left">
        <span class="title_font">预警数据列表</span>
      </div>
      <div style="float: right">
        <el-button v-if="!flowSetup.done" type="primary" size="mini" @click="batchEditStatus"
        >批量修改预警状态</el-button
        >
      </div>
    </div>
    <el-table
            ref="tab"
            stripe
            :data="tabData"
            @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection"></el-table-column>
      <el-table-column
              v-for="(item, index) in colArr"
              :key="index"
              :prop="item.columnComment"
              :label="item.columnComment"
              width="180"
      >
        <slot :row="item" :$index="index"></slot>
      </el-table-column>
      <el-table-column prop="warningStatus" label="预警状态" width="280">
        <template slot-scope="scope" >
          <el-select v-if="flowSetup.done" disabled  v-model="scope.row.warningStatus" placeholder="请选择">
            <el-option
                    v-for="(item, i) in warningStatusOption"
                    :key="i"
                    :label="item.label"
                    :value="item.value"
            ></el-option>
          </el-select>
          <el-select v-else  v-model="scope.row.warningStatus" placeholder="请选择">
            <el-option
                    v-for="(item, i) in warningStatusOption"
                    :key="i"
                    :label="item.label"
                    :value="item.value"
            ></el-option>
          </el-select>
        </template>
        <!-- <template slot-scope="scope" v-else>
          <el-select v-model="scope.row.warningStatus" placeholder="请选择">
            <el-option
              v-for="(item, i) in warningStatusOption"
              :key="i"
              :label="item.label"
              :value="item.value"
              :disabled
            ></el-option>
          </el-select>
        </template> -->

      </el-table-column>
      <el-table-column prop="opinions" label="处理意见" width="280">
        <template slot-scope="scope">
          <el-input
                  v-if="flowSetup.done" disabled
                  type="input"
                  :title="scope.row.opinions"
                  v-model="scope.row.opinions"
          ></el-input>
          <el-input
                  v-else
                  type="input"
                  :title="scope.row.opinions"
                  v-model="scope.row.opinions"
          ></el-input>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
            title="选择预警状态"
            v-if="dialogVisibleSelectStatus"
            :visible.sync="dialogVisibleSelectStatus"
            :close-on-click-modal="false"
            width="80%"
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
  import { mapState } from "vuex";
  import selectStatus from "./selectStatus";
  export default {
    props: ["versionUuid", "appDataUuid","applyType","flowSetup"],
    components: {
      selectStatus,
    },
    data() {
      return {
        // versionUuid1: "",
        // appDataUuid1: "",
        // applyType1: "",
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
            label: "挂号中",
          },
          {
            value: "2",
            label: "预警待查",
          },
          {
            value: "3",
            label: "已销号",
          },
        ],
        warningStatus: "",
      };
    },
    mounted: function () {
      // this.appDataUuid1=this.appDataUuid;
      // this.versionUuid1=this.versionUuid;
      // this.applyType1=this.applyType;
      this.query();
    },
    methods: {
      //给表头添加背景色
      // dealHeadStyle(){
      //     return{
      //         background:'#2b2b2b'
      //     }
      // },
      formatter(row, column) {
        return row.address;
      },
      filterTag(value, row) {
        return row.tag === value;
      },
      query() {
        // alert("sdf")
        // alert(this.appDataUuid1)
        this.form.appDataUuid = this.appDataUuid;
        this.$axios
                .post("/ams-clue/busRelation/pa/selectColumn", this.form)
                .then((response) => {
                  console.log(response);
                  this.colArr = response.data.data.columnVoList;
                  this.tabData = response.data.data.busList;
                })
                .catch((error) => {
                  console.log(error);
                });
      },
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
        var data = {
          applyBusDataList: this.multipleSelection,
          warningStatus: val,
        };
        this.$axios
                .post("/ams-clue/applyBusData/batchEditStatus", data)
                .then((response) => {
                  if (response.data.code == "0") {
                    this.common.alertMsg(1, "更新成功");
                  } else {
                    this.common.alertMsg(2, "更新失败");
                  }
                })
                .catch((error) => {
                  this.common.alertMsg(2, "更新失败");
                  console.log(error);
                });
        this.query();
      },
      closeSelectStatusdialog() {
        this.dialogVisibleSelectStatus = false;
      },

      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      updateSave(){

        var data = {
          applyBusDataList: this.tabData,
          busRelationUuid: this.appDataUuid,
          applyStatus:this.$store.state.applyInfo.applyInfo.status,
        };
        this.$axios
                .post("/ams-clue/applyBusData/updateSaveBusDatas",data)
                .then((response) => {
                  if (response.data.code == "0") {
                    //修改业务审核状态
                    this.$store.dispatch("applyInfo/setMstate", "0");
                    this.common.alertMsg(1, "更新成功");
                  } else {
                    this.common.alertMsg(2, "更新失败");
                  }
                })
                .catch((error) => {
                  this.common.alertMsg(2, "更新失败");
                  console.log(error);
                });
      }
    },
  };
</script>

<style scoped>
</style>  
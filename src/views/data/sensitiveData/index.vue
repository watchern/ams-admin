<template>
  <div class="page-container">
    <div class="pd20">
      <div class="filter-container">
      <div class="query-field">
        <el-form :inline="true"
                 :model="query"
                 label-position="bottom">
          <el-form-item label="规则名称：">
            <el-input v-model="dataBaseData.ruleName"
                      placeholder="请输入内容"
                      clearable></el-input>
          </el-form-item>

          <el-form-item label="角色名称：">
            <el-input v-model="dataBaseData.createUserName"
                      placeholder="请输入内容"
                      clearable></el-input>
          </el-form-item>

<!--          <el-form-item label="创建时间：">-->
<!--            <el-date-picker v-model="createTime"-->
<!--                            type="daterange"-->
<!--                            range-separator="-"-->
<!--                            start-placeholder="开始日期"-->
<!--                            end-placeholder="结束日期"-->
<!--                            @change="getTime">-->
<!--            </el-date-picker>-->
<!--          </el-form-item>-->
          <el-form-item label="创建时间范围："
                                        prop="createTime"
                                        style="display: inline-block;">
          <el-date-picker v-model="dataBaseData.startTime"
                          type="datetime"
                          placeholder="开始时间"
                          value-format="yyyy-MM-dd HH:mm:ss" />
          <el-date-picker v-model="dataBaseData.endTime"
                          type="datetime"
                          placeholder="结束时间"
                          value-format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       @click="goQuery">查询</el-button>
            <el-button type="primary"
                       @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="mb10">
        <el-row>
          <el-col align="right">
            <el-button type="primary"
                       class="oper-btn"
                       @click="add()">
              <img src="../../../styles/image/add.png"
                   class="btn_icon icon1"
                   alt="">
              <img src="../../../styles/image/add2.png"
                   class="btn_icon icon2"
                   alt="">
              新增
            </el-button>

            <el-button type="primary"
                       class="oper-btn"
                       @click="edit">
              <img src="../../../styles/image/edits.png"
                   class="btn_icon"
                   alt="">
              编辑</el-button>
            <el-button class="oper-btn"
                       type="primary"
                       @click="goDelete"><img src="../../../styles/image/delete.png"
                   class="btn_icon"
                   alt="">删除</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 列表 -->
      <el-table
                v-loading="loading"
                :data="tableData"
                border
                style="width: 100%"
                stripe
                row-key="id"
                height="calc(100vh - 300px)"
                @selection-change="handleSelectionChange">
        <!-- :reserve-selection="true" -->
        <el-table-column type="selection"
                         width="55"> </el-table-column>
        <el-table-column prop="ruleName"
                         label="规则名称"
                         show-overflow-tooltip
                         min-width="150px"></el-table-column>
        <el-table-column prop="isAtartUp"
                         label="是否启动"
                         align="center"
                         show-overflow-tooltip
                         width="150px">
          <template slot-scope="scope">
            <span v-if="scope.row.isAtartUp === 0">否</span>
            <span v-if="scope.row.isAtartUp === 1">是</span>
          </template>
        </el-table-column>
        <el-table-column prop="secretLevelName"
                         label="数据密级"
                         width="150px"
                         align="center"
                         show-overflow-tooltip></el-table-column>
        <el-table-column prop="recognitionRulesName"
                         label="试别规则"
                         width="150px"
                         align="center"
                         show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime"
                         label="创建时间"
                         align="center"
                         show-overflow-tooltip
                         width="200px">
          <template slot-scope="scope">
            {{ dateFormatter(scope.row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="createUserName"
                         label="创建人"
                         align="center"
                         show-overflow-tooltip
                         width="200px"></el-table-column>
      </el-table>
      </div>
      <el-pagination layout="total, sizes, prev, pager, next, jumper"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :total="dataBaseData.total"
                     ></el-pagination>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog :visible.sync="showAddDialog"
               :title="sensitiveTitle"
               :close-on-click-modal="false"
               :modal-append-to-body="false"
               width="40%"
               class="dialog-add"
               :close-on-press-escape="false">
      <Add @close="closeAddDrawer"
           :sensitiveObj="sensitiveObj"
           @ok="addSucceed"
           v-if="showAddDialog"></Add>
    </el-dialog>
  </div>

</template>

<script>
import Add from "./add.vue";
import { getList, deleteSensitive, getById } from "@/api/data/sensitiveData";
export default {
  name: "sensitiveData",
  components: {
    Add,
  },
  props: [],
  data () {
    return {
      //新增弹窗是否显示
      showAddDialog: false,
      createTime: [],
      loading: false,
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
      },
      dataBaseData: {
        ruleName: "",
        createUserName: "",
        startTime: null,
        endTime: null,
        total: 0,
      },
      tableData: [],
      multipleSelection: [],
      sensitiveObj: {},
      sensitiveTitle: "",
    };
  },
  computed: {},
  watch: {},
  mounted () {
    this.init();
  },
  methods: {
    init () {
      this.loading = true;
      this.pageQuery.condition = this.dataBaseData;
      getList(this.pageQuery).then((res) => {
        this.loading = false;
        this.tableData = res.data.records;
        this.dataBaseData.total = res.data.total;
      });
    },
    // getTime (date) {
    //   this.dataBaseData.startTime = date[0];
    //   this.dataBaseData.endTime = date[1];
    // },
    // 查询
    goQuery () {
      this.init();
    },
    // 重置
    reset () {
      this.dataBaseData = {
        ruleName: "",
        createUserName: "",
        startTime: null,
        endTime: null,
      };
      this.createTime = []
      this.goQuery()
    },
    // 添加
    add () {
      this.sensitiveTitle = "新增敏感数据识别规则";
      this.showAddDialog = true;
    },
    // 删除
    goDelete () {
      if (this.multipleSelection.length === 1) {
        this.$confirm("确定删除该条数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true,
        }).then(() => {
          deleteSensitive(this.multipleSelection[0].bizSensitiveUuid).then(
            (res) => {
              if (res.code === 0) {
                this.init();
              }
              this.$message({
                message: res.msg,
                type: "success",
              });
            }
          );
        });
      } else {
        this.$message({
          message: "只能选择一条数据删除",
          type: "warning",
        });
      }
    },
    // 修改
    edit () {
      if (this.multipleSelection.length === 1) {
        getById(this.multipleSelection[0].bizSensitiveUuid).then((res) => {
          if (res.code === 0) {
            this.sensitiveTitle = "修改敏感数据识别规则";
            this.sensitiveObj = res.data;
            this.showAddDialog = true;
          } else {
            this.$message({
              message: res.msg,
              type: "error",
            });
          }
        });
      } else {
        this.$message({
          message: "请选择一条数据进行修改",
          type: "warning",
        });
      }
    },
    // 分页
    handleSizeChange (val) {
      this.dataBaseData.pageSize = val;
      this.init();
    },
    // 分页
    handleCurrentChange (val) {
      this.dataBaseData.pageNo = val;
      this.init();
    },
    // 关闭弹窗
    closeAddDrawer () {
      this.showAddDialog = false;
    },
    // 添加保存
    addSucceed () {
      this.showAddDialog = false;
      this.init();
    },
    handleSelectionChange (val) {
      this.multipleSelection = val;
    },
    dateFormatter (str, time) {
      const datetime = str;
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
        let d = "";
        if (time == "year") {
          d = year;
        } else if (time == "month") {
          d = year + "-" + month;
        } else {
          d =
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
        }
        return d;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/*.buttom-page-content {*/
/*  display:flex;*/
/*  justify-content: center;*/
/*  padding-top: 25px;*/

/*}*/

/*修改文本框样式*/
// .detail-form ::v-deep .el-textarea .el-textarea__inner {
//   border: 1px solid #343942 !important;
//   border-radius: 1px;
// }
// .detail-form ::v-deep .el-textarea .el-textarea__inner {
//   border: 1px solid #343942 !important;
//   border-radius: 1px;
// }

/*.detail-form ::v-deep .footBtn{*/
/*  float: right;*/
/*}*/
/*  !*按钮边框黑色*!*/
/*  .detail-form ::v-deep .el-radio__inner {*/
/*    border: 1px solid #343942;*/
/*  }*/
/*!*选中后按钮边框蓝色*!*/
/*.detail-form ::v-deep .el-radio__inner.is-checked  {*/
/*  border: 1px solid #1890ff;*/
/*}*/
</style>
<style  scoped>
.listDisplay {
  height: calc(100vh - 140px);
}
.searchBlock {
  width: 100%;
  float: left;
}
.search {
  float: left;
  display: inline-block;
  margin-right: 16px;
  margin-bottom: 8px;
}
.searchBlock_left {
  float: left;
}
.search-btn {
  float: right;
  width: 170px;
  text-align: right;
  display: flex;
}
.searchBlock .search-title {
  width: auto;
}
.searchBlock .search-operation {
  min-width: 180px;
}
.searchBlock >>> .el-input__inner {
  width: 180px;
}
.searchBlock >>> .el-range-editor--medium.el-input__inner .el-range-input {
  height: 32px;
  width: 100px;
}
.searchBlock >>> .el-date-editor {
  width: 240px;
  height: 32px;
}
.operationBut {
  padding: 10px;
  box-sizing: border-box;
}
</style>



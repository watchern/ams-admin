<template>
  <div class="sensitiveData">
    <!-- 搜索 -->
    <div class="searchBlock">
      <div class="search">
        <div class="search-title">规则名称:</div>
        <div class="search-operation">
          <el-input
            v-model="dataBaseData.ruleName"
            size="small"
            placeholder="请输入内容"
            clearable
          ></el-input>
        </div>
      </div>
      <div class="search">
        <div class="search-title">角色名称:</div>
        <div class="search-operation">
          <el-input
            v-model="dataBaseData.createUserName"
            size="small"
            placeholder="请输入内容"
            clearable
          ></el-input>
        </div>
      </div>
      <div class="search">
        <div class="search-title">创建时间:</div>
        <div class="search-operation">
          <el-date-picker
            v-model="createTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="getTime"
          >
          </el-date-picker>
        </div>
      </div>
      <div class="search-btn">
        <el-button size="mini" type="primary" @click="goQuery">查询</el-button>
        <el-button size="mini" type="primary" @click="reset">重置</el-button>
      </div>
    </div>
    <!-- 列表 -->
    <div class="listDisplay">
      <div class="operation">
        <!-- <div class="num">
          查询结果 <span>{{ dataBaseData.total }}</span> 条
        </div> -->
        <div class="operationBut">
          <el-button size="mini" type="primary" @click="add">添加</el-button>
          <el-button size="mini" type="primary" @click="edit">修改</el-button>
          <el-button size="mini" type="primary" @click="goDelete"
            >删除</el-button
          >
        </div>
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        stripe
        v-loading="loading"
        row-key="id"
        height="calc(100vh - 290px)"
        @selection-change="handleSelectionChange"
      >
        <!-- :reserve-selection="true" -->
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column
          prop="ruleName"
          label="规则名称"
          show-overflow-tooltip
          min-width="150px"
        ></el-table-column>
        <el-table-column
          prop="isAtartUp"
          label="是否启动"
          show-overflow-tooltip
          width="150px"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.isAtartUp === 0">否</span>
            <span v-if="scope.row.isAtartUp === 1">是</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="secretLevelName"
          label="数据密级"
          width="150px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="recognitionRulesName"
          label="试别规则"
          width="150px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          show-overflow-tooltip
          width="200px"
        >
          <template slot-scope="scope">
            {{ dateFormatter(scope.row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="createUserName"
          label="创建人"
          show-overflow-tooltip
          width="200px"
        ></el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :total="dataBaseData.total"
        ></el-pagination>
      </div>
    </div>
    <!-- 新增弹窗 -->
    <el-dialog
      :visible.sync="showAddDialog"
      :title="sensitiveTitle"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      width="40%"
      :close-on-press-escape="false"
    >
      <Add
        @close="closeAddDrawer"
        :sensitiveObj="sensitiveObj"
        @ok="addSucceed"
        v-if="showAddDialog"
      ></Add>
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
  data() {
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
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.loading = true;
      this.pageQuery.condition = this.dataBaseData;
      getList(this.pageQuery).then((res) => {
        this.loading = false;
        this.tableData = res.data.records;
        this.dataBaseData.total = res.data.total;
      });
    },
    getTime(date) {
      this.dataBaseData.startTime = date[0];
      this.dataBaseData.endTime = date[1];
    },
    // 查询
    goQuery() {
      this.init();
    },
    // 重置
    reset() {
      this.dataBaseData = {
        ruleName: "",
        createUserName: "",
        startTime: null,
        endTime: null,
      };
      this.createTime=[]
      this.goQuery()
    },
    // 添加
    add() {
      this.sensitiveTitle = "新增敏感数据识别规则";
      this.showAddDialog = true;
    },
    // 删除
    goDelete() {
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
          message: "只能选择一条数据进行修改",
          type: "warning",
        });
      }
    },
    // 修改
    edit() {
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
          message: "只能选择一条数据进行修改",
          type: "warning",
        });
      }
    },
    // 分页
    handleSizeChange(val) {
      this.dataBaseData.pageSize = val;
      this.init();
    },
    // 分页
    handleCurrentChange(val) {
      this.dataBaseData.pageNo = val;
      this.init();
    },
    // 关闭弹窗
    closeAddDrawer() {
      this.showAddDialog = false;
    },
    // 添加保存
    addSucceed() {
      this.showAddDialog = false;
      this.init();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    dateFormatter(str, time) {
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

<style lang="scss" scoped></style>

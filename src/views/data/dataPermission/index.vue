<template>
  <div class="dataPermission">
    <!-- 搜索 -->
    <div class="searchBlock">
      <div class="search">
        <div class="search-title">申请名称:</div>
        <div class="search-operation">
          <el-input
            v-model="dataBaseData.name"
            size="small"
            placeholder="请输入内容"
            clearable
          ></el-input>
        </div>
      </div>
      <div class="search">
        <div class="search-title">申请人:</div>
        <div class="search-operation">
          <el-input
            v-model="dataBaseData.name"
            size="small"
            placeholder="请输入内容"
            clearable
          ></el-input>
        </div>
      </div>

      <div class="search">
        <div class="search-title">列表类型:</div>
        <div class="search-operation">
          <el-select
            v-model="dataBaseData.serverid"
            filterable
            clearable
            placeholder="全部"
            size="small"
          >
            <el-option
              v-for="(item, index) in listType"
              :key="index"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
      </div>

      <div class="search">
        <div class="search-title">申请时间范围:</div>
        <div class="search-operation">
          <el-date-picker
            v-model="dataBaseData.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
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
          <el-button size="mini" type="primary" @click="goDelete"
            >删除</el-button
          >
          <el-button size="mini" type="primary" @click="goHandle"
            >办理</el-button
          >
          <el-button size="mini" type="primary" @click="goExport"
            >导出</el-button
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
        height="calc(100vh - 310px)"
      >
        <el-table-column type="selection" width="55" :reserve-selection="true">
        </el-table-column>
        <el-table-column
          prop="name"
          label="申请名称"
          show-overflow-tooltip
          min-width="150px"
        ></el-table-column>
        <el-table-column
          prop="type"
          label="申请时间"
          show-overflow-tooltip
          min-width="150px"
        >
        </el-table-column>
        <el-table-column
          prop="apComServerData.displayname"
          label="当前名称"
          min-width="150px"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="ssComIndustrysData.sciName"
          label="状态"
          width="100px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="datatype"
          label="申请人"
          width="150px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="mobile" label="操作" width="120px">
          <template slot-scope="scope">
            <div class="editBtn" @click="processView(scope.row)">流程查看</div>
          </template>
        </el-table-column>
      </el-table>
      <!-- <div class="pager">
        <el-pagination
          small
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :total="dataBaseData.total"
        ></el-pagination>
      </div> -->
    </div>
    <!-- 新增弹窗 -->
    <el-dialog
      :visible.sync="showAddDialog"
      title="创建申请"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      width="80%"
      :close-on-press-escape="false"
    >
      <Add @close="closeAddDrawer" @ok="addSucceed" v-if="showAddDialog"></Add>
    </el-dialog>
  </div>
</template>

<script>
import Add from './add.vue'
export default {
  name: "dataPermission",
  components: {
    Add,
  },
  props: [],
  data() {
    return {
      listType: [{ name: "待办", id: "1" }],
      //新增弹窗是否显示
      showAddDialog: false,
      loading: false,
      dataBaseData: {},
      tableData: [],
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    // 查询
    goQuery() {},
    // 重置
    reset() {},
    // 添加
    add() {
      this.showAddDialog = true;
    },
    // 删除
    goDelete() {},
    // 办理
    goHandle() {},
    // 导出
    goExport() {},
    // 流程查看
    processView() {},
    // 关闭弹窗
    closeAddDrawer() {
      this.showAddDialog = false
    },
    // 添加保存
    addSucceed() {
      this.showAddDialog = false
    },
  },
};
</script>

<style lang="sass" scoped></style>

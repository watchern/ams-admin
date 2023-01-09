<template>
  <div class="dlag_conter">
    <el-container class="app-container">
      <el-aside class="tree-side">
        <el-input v-model="filterText"
                  placeholder="输入关键字进行过滤"
                  class="tree-search" />
        <el-tree :data="data"
                 :props="defaultProps"
                 @node-click="handleNodeClick"
                 :filter-node-method="filterNode"
                 ref="tree"></el-tree>
      </el-aside>
      <div style="flex: 1;"
           class="padding10 child_table">
        <el-table v-loading="listLoading"
                  ref="multipleTable"
                  style="width: 100%;"
                  :data="list"
                  border
                  fit
                  highlight-current-row
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection"
                           width="55" />
          <el-table-column label="人员名称"
                           align="center"
                           prop="cnname" />
          <el-table-column label="组织名称"
                           align="center"
                           prop="org.cnname" />
        </el-table>
        <el-pagination :current-page="page"
                       :page-sizes="[10, 20, 30, 50]"
                       :page-size="limit"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total"
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange" />
      </div>
    </el-container>
  </div>
</template>

<script>
import { findOrgTree, findPeopleByOrgId } from "@/api/base/orgpeople";
export default {
  data () {
    return {
      data: [], //组织人员树的数据
      defaultProps: {
        //组织人员树的默认属性
        children: "children",
        label: "name",
      },
      filterText: null, //组织树筛选框输入数据
      list: null, //人员表格数据
      listLoading: true,
      dataList: [], //存放后台传来的所有人员数据，用于前台分页
      total: 0, //存放分页总数据条数
      page: 1, //分页初始化显示第一页
      limit: 10, //默认显示前10条
      selectValue: [], //存放多选框选中的数据
    };
  },
  watch: {
    filterText (val) {
      // 搜索树
      this.$refs.tree.filter(val);
    },
  },
  components: {},
  mounted: function () {
    this.$nextTick(function () {
      this.$on('clear', function () {
        this.$refs.multipleTable.clearSelection();//清空选择的认权人
        this.findOrgTree_data();
        this.list = [];
        this.total = 0;
      })
    })
  },

  created () {
    this.findOrgTree_data();
    this.initData("");
  },

  methods: {
    /**
     * 初始化组织树
     */
    findOrgTree_data () {
      findOrgTree().then((resp) => {
        this.data = resp.data;
      });
    },
    /**
     * 点击树节点时候触发
     */
    handleNodeClick (data) {
      this.listLoading = true;
      this.initData(data.id);
    },
    /**
     * 过滤树节点方法
     */
    filterNode (value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    /**
     * 初始化表格数据
     */
    initData (orgId) {
      findPeopleByOrgId(orgId).then((resp) => {
        this.dataList = resp.data;
        this.listLoading = false;
        if (this.dataList != null) {
          this.getList();
        }
      });
    },
    // 处理数据
    getList () {
      // es6过滤得到满足搜索条件的展示数据list
      this.list = this.dataList.filter(
        (item, index) =>
          index < this.page * this.limit &&
          index >= this.limit * (this.page - 1)
      );
      this.total = this.dataList.length;
    },
    // 当每页数量改变
    handleSizeChange (val) {
      this.limit = val;
      this.getList();
    },
    // 当当前页改变
    handleCurrentChange (val) {
      this.page = val;
      this.getList();
    },
    /**
     * 当多选框改变时触发
     */
    handleSelectionChange (val) {
      this.selectValue = val
    },
    /**
     * 返回选中的数据方法
     */
    getSelectValue () {
      return this.selectValue
    }
  },
};
</script>
<style scoped>
@import url("../../assets/css/common.css");
</style>

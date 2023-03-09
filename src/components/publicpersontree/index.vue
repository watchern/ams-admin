<template>
  <div>
    <el-container class="app-container">
      <el-aside class="tree-side" style="height: 515px; overflow: auto;">
        <el-input v-model="filterText"
                  placeholder="输入关键字进行过滤"
                  class="tree-search" />
        <el-tree :data="data"
                 :props="defaultProps"
                 @node-click="handleNodeClick"
                 :filter-node-method="filterNode"
                 ref="tree"></el-tree>
      </el-aside>
      <div class="padding10_l child_table">
        <el-table v-loading="listLoading"
                  ref="multipleTable"
                  height="480px"
                  style="width: 100%;"
                  :data="list"
                  border
                  fit
                  highlight-current-row
                  :row-key="row => row.personuuid"
                  @select="handleSelectionChange"
                  @select-all="handleSelectionChange2">
          <el-table-column type="selection"
                           reserve-selection
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
      list: [], //人员表格数据
      listLoading: true,
      dataList: [], //存放后台传来的所有人员数据，用于前台分页
      total: 0, //存放分页总数据条数
      page: 1, //分页初始化显示第一页
      limit: 10, //默认显示前10条
      selectValue: [], //存放多选框选中的数据
    };
  },
  props: {
    reverseDisplay: { // 反显数据，传递人员对象集合
      type: Array,
      required: false,
    }
  },
  watch: {
    filterText (val) {
      // 搜索树
      this.$refs.tree.filter(val);
    },
    reverseDisplay: {
      handler () {
        this.refreshSelected();
        this.reverseDisplaySelected();
      },
      deep: true
    }
  },
  components: {},
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
        console.log("加载人员", this.dataList);
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
      // 反显数据默认选中
      this.reverseDisplaySelected();
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
    handleSelectionChange (val, row) {
      // 如果没有传递需要返显的数据，按原来的方式运行
      if (this.reverseDisplay == null) {
        this.selectValue = val;
        return;
      }
      if (val.length && val.indexOf(row) !== -1) {
        this.reverseDisplay.push(row)
      } else {
        for (let i = 0; i < this.reverseDisplay.length; i++) {
          if (this.reverseDisplay[i].personuuid == row.personuuid) {
            this.reverseDisplay.splice(i, 1);
            i--;
          }
        }
      }
    },
    /**
     * 全选是将全选人员去重添加到返回人员中，如果取消全选，从返回人员中去除
     */
    handleSelectionChange2 (val) {
      if (val.length == 0) {
        for (let i = 0; i < this.reverseDisplay.length; i++) {
          for (let j = 0; j < this.list.length; j++) {
            if (this.reverseDisplay[i].personuuid == this.list[j].personuuid) {
              this.reverseDisplay.splice(i, 1);
              i--;
            }
          }
        }
      } else {
        let tempArr = val;
        for (let i = 0; i < this.reverseDisplay.length; i++) {
          for (let j = 0; j < tempArr.length; j++) {
            if (this.reverseDisplay[i].personuuid == tempArr[j].personuuid) {
              tempArr.splice(j, 1);
              j--;
            }
          }
        }
        this.reverseDisplay.push(...tempArr);
      }
    },
    /**
     * 返回选中的数据方法
     */
    getSelectValue () {
      if (this.reverseDisplay == null) {
        return this.selectValue;
      }
      return this.reverseDisplay;
    },
    /**
     * 手动刷新人员选中数据
     */
    refreshSelected () {
      this.$refs.multipleTable.clearSelection();
    },
    /**
     * 反显数据
     */
    reverseDisplaySelected () {
      // 数据反显
      if (this.reverseDisplay != null && this.reverseDisplay.length > 0) {
        this.list.forEach(data => {
          this.$refs.multipleTable.toggleRowSelection(data, false);
          for (let i = 0; i < this.reverseDisplay.length; i++) {
            if (data.personuuid == this.reverseDisplay[i].personuuid || data.personuuid == this.reverseDisplay[i].personUuid) {
              this.$refs.multipleTable.toggleRowSelection(data, true);
              this.reverseDisplay[i] = data;
            }
            // 同步传递进来的数据格式
            if (this.reverseDisplay[i].personUuid != undefined && this.reverseDisplay[i].personName != undefined) {
              this.reverseDisplay[i].personuuid = this.reverseDisplay[i].personUuid;
              this.reverseDisplay[i].cnname = this.reverseDisplay[i].personName;
            }
          }
        });
      }
    }
  },
};
</script>
<style scoped>
@import url("../../assets/css/common.css");
.dlag_conter >>> .tree-side {
  height: 100%;
}
.dlag_conter >>> .el-tree {
  /* height: 330px; */
}
.child_table {
  /*width: calc(100% - 300px);*/
  flex:1;
  box-sizing: border-box;
}
/*.tree-side,*/
/*.child_table >>> .el-table {*/
/*  height: 350px;*/
/*  overflow: auto;*/
/*}*/
</style>

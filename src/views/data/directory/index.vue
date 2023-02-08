<template>
  <div class="page-container">
    <!-- left_conter -->
    <div class="left_conter">
      <LeftTree
        ref="dataTree"
        @details="Details"
        @queryList="query_list_data"
      ></LeftTree>
    </div>
    <div class="right_conter padding10">
      <DataResourceDisplay @on_deails="onDeailsChange"
                           :isBtn="isBtn"
                           @handleCurrentChange="handleCurrent"
                           @handleSizeChange="handleSize"
                           :list="list"
                           :list_data="list_data"
                           :list_loading="list_loading"
                           v-if="show_details == false"></DataResourceDisplay>

      <!-- 基本信息详情 -->
      <Details ref="Details_ref"
               :tableMetaUuid="tableMetaUuid"
               :isDisable_input="isDisable_input"
               :is_Edit_list="is_Edit_list"
               @query_data="QueryData"
               @step="Step"
               v-if="show_details == true"></Details>
    </div>
  </div>
</template>

<script>
import LeftTree from "@/components/loginTree/leftTree.vue";
import DataResourceDisplay from '@/components/directory/dataResourceDisplay.vue';
import Details from '@/components/directory/details.vue';
import {
  listByTreePage, //列表
} from '@/api/data/table-info';

export default {
  components: {
    LeftTree,
    DataResourceDisplay,
    Details,
  },
  props: ['dataUserId', 'sceneCode'],
  data () {
    return {
      show_details: false, //显示基本信息详情
      isBtn: false, //是否显示按钮
      list_loading: false, //列表loading
      list: [],
      list_data: {}, //分页信息
      // list_details: {},// 点击列表进入详情
      tableMetaUuid: '', //详情id
      // tableRelationQueryUuid: '',//id
      is_Edit_list: 0, //是否编辑
      isDisable_input: true, //详情禁止输入修改
    };
  },
  mounted () {
    this.$refs.dataTree.loadLeftTreeTypeFun("5");
  },
  methods: {
    Details (tableMetaUuid, show_details, isDisable_input) {
      this.tableMetaUuid = tableMetaUuid
      this.show_details = show_details;
      this.isDisable_input = isDisable_input;
      this.$nextTick(() => {
        this.$refs.Details_ref.$refs.tableLines.init(1)//刷新列表 更新关系树
        this.$refs.Details_ref.post_sql_data()//更新查看sql
        this.$refs.Details_ref.table_list(this.tableMetaUuid)//更新列信息
      })
    },
    // 返回上一步
    Step () {
      this.show_details = false;
      this.query_list(this.$refs.dataTree.query, false);
    },
    // 获取资料树的参数
    QueryData () {
      this.query_list_data(this.$refs.dataTree.query, false);
    },
    // 列表 接口
    query_list_data (data, show_details) {
      // this.listLoading = true;
      this.show_details = show_details; //显示列表
      // this.query = data;
      // this.listLoading = true;
      this.list_loading = true; //子组件loading
      let params = {
        businessSystemId: data.businessSystemId, //id主键
        tableThemeId: data.tableThemeId, //主题
        tableLayeredId: data.tableLayeredId, //分层
        folderUuid: data.folderUuid, //目录
        dataSource: data.dataSource, //数据源
        pageNo: data.pageNo,
        pageSize: data.pageSize,
        tbName: data.tbName,
      };
      listByTreePage(params).then(resp => {
        this.list_loading = false; //子组件loading
        this.list_data = resp.data;
        this.list = resp.data.records;
      });
    },
    // 显示基本信息详情
    onDeailsChange (data) {
      this.tableMetaUuid = data.tableMetaUuid;
      this.show_details = true;
      this.isDisable_input = true;
    },
    // 分页
    handleCurrent (val) {
      this.$refs.dataTree.query.pageNo = val;
      this.query_list_data(this.$refs.dataTree.query, false);
    },
    // 每页多少条
    handleSize (val) {
      this.$refs.dataTree.query.pageSize = val;
      this.query_list_data(this.$refs.dataTree.query, false);
    },
  },
};
</script>

<style scoped>
@import url("./../../../assets/css/common.css");
/* 隐藏列表的多选框 */
.right_conter >>> .el-table__header-wrapper {
  /* border: 1px solid blue; */
  display: none;
}

.page-container {
  display: flex;
  padding: 0 !important;
}

.left_conter {
  width: 340px;
  position: relative;
  height: calc(100vh - 120px);
}

.left_conter >>> .el-tabs__item {
  width: 80px;
  text-align: center;
}

.left_conter >>> .el-tabs__nav {
  width: 100%;
}

.tree >>> .filter-tree {
  margin-top: 0;
}

.tree .tree-option {
  margin-top: 0 !important;
}

.agreeicon0 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_0.png");
  vertical-align: top;
  *vertical-align: middle;
}

.agreeicon1 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_1.png");
  vertical-align: top;
  *vertical-align: middle;
}

.agreeicon2 {
  display: inline-block;
  height: 14px;
  width: 14px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_2.png");
  vertical-align: top;
  *vertical-align: middle;
}
</style>

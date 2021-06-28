<template class="divContent">
  <div class="zdytabledata">
    <el-tabs ref="tabs" v-model="tabShowName" style="text-aling = center">
      <el-tab-pane
        v-if="openType === 'showTable' || openType === 'tableRegister'"
        label="基本信息"
        name="basicinfo"
        ><basic-info :table-id="tableId" :open-type="openType"
      /></el-tab-pane>
      <el-tab-pane label="列" name="column"
        ><column
          ref="column"
          :table-id="tableId"
          :forder-id="forderId"
          :open-type="openType"
          @append-node="appendnode"
          @table-show="tableshow"
      /></el-tab-pane>
      <!-- <el-tab-pane v-if="openType === 'showTable' || openType === 'tableRegister'" label="约束" name="constraint"><constraint :table-id="tableId" /></el-tab-pane> -->
      <!-- <el-tab-pane v-if="openType === 'showTable' || openType === 'tableRegister'" label="索引" name="indexSql"><index-sql :table-id="tableId" :open-type="openType" /></el-tab-pane> -->

      <el-tab-pane label="关联关系" name="tablerelation"><tablerelation :table-id="tableId" :open-type="openType" /></el-tab-pane>
<!--      <el-tab-pane v-if="openType === 'showTable' || openType === 'tableRegister'" label="创建语句" name="createSql"><create-sql :table-id="tableId" :open-type="openType" /></el-tab-pane>-->
      <el-tab-pane v-if="openType === 'showTable' || openType === 'tableRegister'" label="业务信息" name="bizInfo"><biz-info :table-id="tableId" :open-type="openType" /></el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import basicInfo from "@/views/data/table/basicinfo";
import column from "@/views/data/table/column";
import createSql from "@/views/data/table/createsql";
import bizInfo from "@/views/data/table/bizinfo";
import tablerelation from "@/views/data/table/tablerelation";
export default {
  components: { basicInfo, column, createSql, bizInfo, tablerelation },
  // eslint-disable-next-line vue/require-prop-types
  props: ["tableId", "tabShow", "openType", "forderId"],
  data() {
    return {
      tabShowName: "",
    };
  },
  watch: {
    tabShowName: {
      handler(newName, oldName) {
        this.$emit("update:tab-show", newName);
      },
      deep: true,
    },
  },
  created() {
    this.initTabs();
    this.tabShowName = this.tabShow;
  },
  methods: {
    initTabs() {
      if (this.openType === "addType") {
        this.$refs.tabs.$children[0].$refs.tabs[3].style.display = "none";
        this.$refs.tabs.$children[0].$refs.tabs[3].style.display = "none";
      }
    },
    appendnode(childData, parentNode) {
      this.$emit("append-node", childData, this.clickNode);
    },
    tableshow(show) {
      this.$emit("table-show", show);
    },
  },
};
</script>
<style lang="scss">
.zdytabledata .el-tabs__content {
  max-height: 550px;
  overflow: scroll;
}
</style>
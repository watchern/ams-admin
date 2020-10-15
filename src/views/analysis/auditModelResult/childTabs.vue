<template>
  <!-- childTabs是子页签组件 -->
  <el-tabs type="border-card">
    
    <el-tab-pane label="主表"
      ><childTabCon :nowtable="maintable" :modelUuid="modelUuid"></childTabCon
    ></el-tab-pane>
    <el-tab-pane
      :label="'辅表' + (key + 1)"
      v-for="(item, key) in helptables"
      :key="key"
      ><childTabCon :nowtable="item"></childTabCon>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import childTabCon from "@/views/analysis/auditModelResult/childTabCon";
import { now } from "moment";
export default {
  components: {
    childTabCon,
  },
  props: ["maintable", "helptables","modelUuid"]
};
</script>
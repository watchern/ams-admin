<template>
  <!-- childTabs是子页签组件 -->
  <el-tabs type="border-card">

    <el-tab-pane
      label="主表"
    ><childTabCon :nowtable="maintable" :model-uuid="modelUuid" /></el-tab-pane>
    <el-tab-pane
      v-for="(item, key) in helptables"
      :key="key"
      :label="'辅表' + (key + 1)"
    ><childTabCon :nowtable="item" />
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import childTabCon from '@/views/analysis/auditModelResult/childTabCon'
import { now } from 'moment'
export default {
  components: {
    childTabCon
  },
  props: ['maintable', 'helptables', 'modelUuid']
}
</script>

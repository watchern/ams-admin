<template class="divContent">
  <div>
    <el-tabs v-model="tabShowName" style="text-aling = center">
      <el-tab-pane label="基本信息" name="basicinfo"><basic-info :table-id="tableId" /></el-tab-pane>
      <el-tab-pane label="列" name="column"><column :table-id="tableId" /></el-tab-pane>
      <!-- <el-tab-pane label="约束" name="constraint"><constraint :table-id="tableId" /></el-tab-pane> -->
      <el-tab-pane label="索引" name="indexSql"><index-sql :table-id="tableId" /></el-tab-pane>
      <el-tab-pane label="关联关系" name="correlation"><correlation :table-id="tableId" /></el-tab-pane>
      <el-tab-pane label="创建语句" name="createSql"><create-sql :table-id="tableId" /></el-tab-pane>
      <el-tab-pane label="业务信息" name="bizInfo"><biz-info :table-id="tableId" /></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import basicInfo from '@/views/data/table/basicinfo'
import column from '@/views/data/table/column'
import constraint from '@/views/data/table/constraint'
import indexSql from '@/views/data/table/indexsql'
import createSql from '@/views/data/table/createsql'
import bizInfo from '@/views/data/table/bizinfo'
import correlation from '@/views/data/table/correlation'
export default {
  components: { basicInfo, column, constraint, indexSql, createSql, bizInfo, correlation },
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId', 'tabShow'],
  data() {
    return {
      tabShowName: ''
    }
  },
  watch: {
    tabShowName: {
      handler(newName, oldName) {
        this.$emit('update:tab-show', newName)
      },
      deep: true
    }
  },
  created() {
    this.tabShowName = this.tabShow
  },
  methods: {
  }
}
</script>

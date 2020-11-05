<template>
  <div class="app-container">
    <div>
      <div class="detail-form">
        <el-card title="SQL内容">
          <div id="DivContent" v-html="parentContent" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCreateSql } from '@/api/data/table-info'
export default {
  data() {
    return {
      parentContent: '',
      temp: {
        createSql: ''
      }
    }
  },
  created() {
    var tableId = this.$parent.$data.tableId
    this.initTable(tableId)
  },
  methods: {
    initTable(tableId) {
      getCreateSql(tableId).then(resp => {
        this.parentContent = resp.data
      })
    }
  }}
</script>

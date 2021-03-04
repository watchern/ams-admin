<template>
  <div class="app-container">
    <div>
      <div class="detail-form">
        <el-card title="SQL内容" style="height: 700px">
         <!-- <div id="DivContent" v-html="parentContent" />-->
          <el-input type="textarea" :value="parentContent" :rows="25"  readonly></el-input>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCreateSql } from '@/api/data/table-info'
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId', 'openType'],
  data() {
    return {
      parentContent: '',
      temp: {
        createSql: ''
      }
    }
  },
  created() {
    this.initTable(this.tableId)
  },
  methods: {
    initTable(tableId) {
      if (this.openType !== 'addTable') {
        getCreateSql(tableId).then(resp => {
          this.parentContent = resp.data
        })
      }
    }
  }}
</script>

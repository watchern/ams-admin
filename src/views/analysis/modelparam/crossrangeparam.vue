<template>
      <div id="collapse">
        <div :id="myId" style="padding: 10px 0;display: flex;flex-wrap: wrap" />
      </div>
</template>
<script>
import { initcrossrangeParamHtml } from '@/api/analysis/auditparam'
export default {
  data() {
    return {
    }
  },
  props:['myId']
  ,
  methods: {
    initParamHtmlSS(sql, paramsArr, name,id) {
      initcrossrangeParamHtml(sql, paramsArr, name,id)
    }
  }
}
</script>
<style>
  body {
    margin: 0;
  }
</style>

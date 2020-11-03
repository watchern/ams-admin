<template>
      <div id="collapse">
        <div id="paramCom" style="padding: 10px 0;display: flex;flex-wrap: wrap" />
      </div>
</template>
<script>
import { initcrossrangeParamHtml } from '@/api/analysis/auditparam'
export default {
  data() {
    return {
    }
  },
  methods: {
    initParamHtmlSS(sql, paramsArr, name, modelId) {
      initcrossrangeParamHtml(sql, paramsArr, name, modelId)
    }
  }
}
</script>
<style>
  body {
    margin: 0;
  }
</style>

<template>
  <div>
    <form class="form-horizontal">
      <div class="col-sm-12">
        <div id="accordion" class="panel-group">
          <div class="panel-default">
            <div>
            </div>
            <div id="collapse" class="panel-collapse collapse in">
              <div id="paramCom" style="padding: 10px 0;display: flex;flex-wrap: wrap" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import { initcrossrangeParamHtml } from '@/api/analysis/auditParam'
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

<template>
  <div>
    <form class="form-horizontal">
      <div class="col-sm-12">
        <div id="accordion" class="panel-group">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a
                  data-toggle="collapse"
                  data-parent="#accordion"
                  href="#collapse"
                />
              </h4>
            </div>
            <div id="collapse" class="panel-collapse collapse in">
              <div id="paramCom" class="panel-body" style="padding: 10px 0" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import { initParamHtml } from '@/api/analysis/auditparam'
export default {
  data() {
    return {
    }
  },
  methods: {
    initParamHtmlSS(sql, paramsArr, name, modelId) {
      initParamHtml(sql, paramsArr, name, modelId)
    }

  }
}
</script>
<style>
  body {
    margin: 0;
  }
</style>

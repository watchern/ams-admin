<template>
  <div>
    <table class="table table-bordered" id="paramTable">
      <thead>
        <tr>
          <th align="center">参数名称</th>
          <th align="center" width="400px">默认值设置</th>
          <th align="center">参数说明</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
</template>
<script>
import {
  getParentParamByParamArr,
  initParam,
  initParamHtml_Common,
  createParamTableHtml
} from "@/api/analysis/auditParam";
export default {
  methods: {
    createParamTableHtml(sqlIsChanged, paramArr, canEditor){
        createParamTableHtml(sqlIsChanged, paramArr, canEditor)
    }
  }
};
</script>
<template>
  <div>
    <table class="table table-bordered" id="paramTable">
      <thead>
        <tr>
          <th align="center">参数名称</th>
          <th align="center" width="400px" style="text-align: center">
            默认值设置
          </th>
          <th align="center">参数说明</th>
        </tr>
      </thead>
      <tbody id="tbody">
        <tr>
          <th align="center"></th>
          <th width="400px" style="text-align: center">暂无数据</th>
          <th align="center"></th>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import {
  getParentParamByParamArr,
  initParam,
  initParamHtml_Common,
  createParamTableHtml,
  getParamSettingArr,
} from "@/api/analysis/auditParam";
export default {
  methods: {
    createParamTableHtml(sqlIsChanged, paramArr, canEditor) {
      createParamTableHtml(sqlIsChanged, paramArr, canEditor);
    },
    getParamSettingArr() {
      getParamSettingArr()
    },
  },
};
</script>
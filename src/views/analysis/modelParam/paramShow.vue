<template>
  <div>
    <table id="paramTable" class="table table-bordered">
      <thead>
        <tr>
          <th align="center" style="background-color:#dfe6ec;color:black">参数名称</th>
          <th align="center" width="400px" style="text-align: center;background-color:#dfe6ec;color:black">
            默认值设置
          </th>
          <th align="center" style="background-color:#dfe6ec;color:black">参数说明</th>
        </tr>
      </thead>
      <tbody id="tbody">
        <tr>
          <th align="center" />
          <th width="400px" style="text-align: center">暂无数据</th>
          <th align="center" />
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
  getParamSettingArr
} from '@/api/analysis/auditParam'
export default {
  methods: {
    createParamTableHtml(sqlIsChanged, paramArr, canEditor) {
      createParamTableHtml(sqlIsChanged, paramArr, canEditor)
    },
    getParamSettingArr(paramArr) {
      return getParamSettingArr(paramArr)
    }
  }
}
</script>

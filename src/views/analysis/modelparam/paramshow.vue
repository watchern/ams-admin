<template>
  <div>
    <table id="paramTable" class="table table-bordered">
      <thead>
        <tr>
          <th align="center" style="background-color: #dfe6ec; color: black">
            参数名称
          </th>
          <th
            align="center"
            width="400px"
            style="text-align: center; background-color: #dfe6ec; color: black"
          >
            默认值设置
          </th>
          <th align="center" style="background-color: #dfe6ec; color: black">
            参数说明
          </th>
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
  getParamSettingArr,
} from "@/api/analysis/auditparam";
import {removeJcCssfile,addCssFile,addJsFile} from "@/api/analysis/common"
export default {
  data(){
    return{

    }
  },
  created() {
    //动态引入css
    addCssFile('/lib/bootstrap/css/bootstrap.css','bootstrap')
    addCssFile('/lib/datetimepicker/bootstrap-datetimepicker.min.css','bootstrap-datetimepicker')
    addCssFile( '/lib/icheck/skins/square/blue.css','blue')
    addCssFile('/lib/bootstrap-select/css/bootstrap-select.css','bootstrap-select')
    addCssFile('/lib/switch/bootstrap-switch.css','bootstrap-switch')
    //动态引入js
    //addJsFile('/lib/jquery/jquery-1.9.1.min.js','jquery')
    //addJsFile('/lib/jquery-ui-1.12.1/jquery-ui.min.js','jquery-ui.min')
    addJsFile('/lib/datetimepicker/bootstrap-datetimepicker.js','bootstrap-datetimepicker-js')
    addJsFile('/lib/layui/xm-select.js','xm-select')
    addJsFile('/lib/icheck/icheck.js','icheck')
  },
  beforeDestroy() {
    //移除css
    removeJcCssfile("bootstrap.css","css")
    removeJcCssfile("bootstrap-datetimepicker.min.css","css")
    removeJcCssfile("blue.css","css")
    removeJcCssfile("bootstrap-select.css","css")
    removeJcCssfile("bootstrap-switch.css","css")
    //移除js
    //removeJcCssfile("jquery-1.9.1.min.js","js")
    //removeJcCssfile("jquery-ui.min.js","js")
    removeJcCssfile("bootstrap-datetimepicker.js","js")
    removeJcCssfile("xm-select.js","js")
    removeJcCssfile("icheck.js","js")
  },
  methods: {
    //初始化参数显示界面
    createParamTableHtml(sqlIsChanged, paramArr, canEditor) {
      createParamTableHtml(sqlIsChanged, paramArr, canEditor);
    },
    /**
     * 将数据放到初始化好的参数显示界面中去
     */
    getParamSettingArr(paramArr) {
      return getParamSettingArr(paramArr);
    },
  },
  props: ["myId"],
};
</script>

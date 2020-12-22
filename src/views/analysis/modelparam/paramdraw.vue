<template>
    <div :id="myId+'1'">
        <div :id="myId+'collapse'">
          <div :id="myId" style="padding: 10px 0"></div>
        </div>
    </div>
</template>
<script>
import { initParamHtml } from "@/api/analysis/auditparam";
import {removeJcCssfile,addCssFile,addJsFile} from "@/api/analysis/common"
export default {
  data() {
    return {
      activeName:'1',
      accordionName:'',
      paramsArr:[],
      message:'该模型暂无参数'
    };
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
  props: ["myId"],
  methods: {
    /**
     * 初始化参数渲染界面
     */
    initParamHtmlSS(sql, paramsArr, name, id,serviceInfo) {
      this.accordionName = name
      this.paramsArr = paramsArr
      initParamHtml(sql, paramsArr, name, id,serviceInfo);
    },
  },
};
</script>
<style>
body {
  margin: 0;
}
#zzzzz-zy .el-collapse-item__wrap{overflow: visible}
#zzzzz-zy .el-collapse-item__header,.is-active{border-bottom: 1px solid #e6ebf5;}
</style>

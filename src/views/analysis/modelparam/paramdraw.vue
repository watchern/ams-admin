<template>
    <div :id="myId+'1'">
        <div :id="myId+'collapse'">
          <div :id="myId" style="padding: 10px 0"></div>
        </div>
    </div>
</template>
<script>
import { initParamHtml } from "@/api/analysis/auditparam";
export default {
  data() {
    return {
      activeName:'1',
      accordionName:'',
      paramsArr:[],
      message:'该模型暂无参数'
    };
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

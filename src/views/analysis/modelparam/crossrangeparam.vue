<template>
  <div id="collapse">
    <div :id="myId" style="padding: 10px 0; display: flex; flex-wrap: wrap" />
  </div>
</template>
<script>
import { initcrossrangeParamHtml } from "@/api/analysis/auditparam";
export default {
  data() {
    return {};
  },
  props: ["myId"], //传入的动态id
  methods: {
    /**
     * 初始化横向参数界面
     */
    initParamHtmlSS(sql, paramsArr, name, id) {
      initcrossrangeParamHtml(sql, paramsArr, name, id);
    },
  },
};
</script>
<style>
body {
  margin: 0;
}
</style>

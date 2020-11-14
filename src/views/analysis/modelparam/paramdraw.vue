<template>
  <div>
    <form class="form-horizontal" >
      <div class="col-sm-12" id="zzzzz-zy">
        <div :id="myId+'1'" class="panel-group">
          <div class="panel panel-default">
            <el-collapse v-model="activeName" accordion>
              <el-collapse-item title="请输入参数" name="1">
                <a
                  data-toggle="collapse"
                  :data-parent="'#'+myId+'1'"
                  :href="'#'+myId+'collapse'"
                ></a>
                <div :id="myId+'collapse'" class="panel-collapse collapse in">
                  <div :id="myId" class="panel-body" style="padding: 10px 0" />
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import { initParamHtml } from "@/api/analysis/auditparam";
export default {
  data() {
    return {
      activeName:'1'
    };
  },
  props: ["myId"],
  methods: {
    /**
     * 初始化参数渲染界面
     */
    initParamHtmlSS(sql, paramsArr, name, id) {
      initParamHtml(sql, paramsArr, name, id);
    },
  },
};
</script>
<style>
body {
  margin: 0;
}
#zzzzz-zy .el-collapse-item__wrap{overflow: visible}
</style>

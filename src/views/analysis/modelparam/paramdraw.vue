<template>
  <div>
    <form class="form-horizontal" >
      <div class="col-sm-12" id="zzzzz-zy">
        <div :id="myId+'1'" class="panel-group">
          <div class="panel panel-default">
            <el-collapse v-model="activeName" accordion>
              <el-collapse-item :title="accordionName" name="1">
                <!-- <a
                  data-toggle="collapse"
                  :data-parent="'#'+myId+'1'"
                  :href="'#'+myId+'collapse'"
                ></a> -->
                <div :id="myId+'collapse'" class="panel-collapse collapse in">
                  <div :id="myId" class="panel-body" style="padding: 10px 0"></div>
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

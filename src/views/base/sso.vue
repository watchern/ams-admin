<template>
    系统跳转中...
</template>
<script>
  import { cacheDict } from '@/api/base/sys-dict'
  import { getAllScene } from '@/api/data/scene'
    export default {
      name: "sso",
      created() {
        debugger;
        var params = this.$route.query.param.split(",");
        var personuuid = params[0];
        var prjcode = params[1];
        var mrid = params.length === 3 ? params[2] : null;
        console.log(personuuid);
        console.log(prjcode);
        var sysDict = JSON.parse(sessionStorage.getItem('sysDict'))
        if (sysDict == null) {
          cacheDict().then(resp => {
            sessionStorage.setItem('sysDict', JSON.stringify(resp.data))
          })
        }
        this.$store.dispatch('user/saveScene', "project", "项目场景", prjcode)
        if(mrid == null){  //模型结果查看
          this.$router.push("/analysis/modelresultdetailshow?runTaskRelUuid="+mrid);
        }else{   //否则 模型列表
          this.$router.push("/analysis/auditmodel");
        }

      }
    }
</script>

<style scoped>

</style>

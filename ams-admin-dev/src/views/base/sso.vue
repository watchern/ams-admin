<template>
</template>
<script>
  import { cacheDict } from '@/api/base/sys-dict'
  import { getSceneInst } from '@/api/data/scene'
  import Cookies from 'js-cookie'
    export default {
      name: "sso",
      created() {
        var sceneCode = "project";
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
        getSceneInst(sceneCode , prjcode).then(resp => {
          var prjname = resp.data.dataUserName;
          this.$store.dispatch('user/saveScene', sceneCode, "项目场景", prjcode, personuuid, prjname);
          sessionStorage.setItem('sceneCode', sceneCode);
          sessionStorage.setItem('sceneName', "审计项目场景");
          sessionStorage.setItem('dataUserId', prjcode);
          sessionStorage.setItem('dataUserName', prjname);
          /*saveSession({
            sceneCode: sceneCode,
            sceneName :"审计项目场景",
            dataUserId: prjcode,
            dataUserName: prjname
          });*/
          if(mrid != null){  //模型结果查看
            this.$router.push("/analysis/modelresultdetailshow?runTaskRelUuid="+mrid);
          }else{   //否则 模型列表
            this.$router.push("/analysis/auditmodel");
          }
        })

      }
    }
</script>

<style scoped>

</style>

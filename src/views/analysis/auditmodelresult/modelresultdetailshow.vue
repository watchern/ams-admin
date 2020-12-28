<template>
    <div>
        <childTabs
          v-if="open"
          :maintable="this.mainTable"
          :helptables="this.helpTables"
          :model-uuid="this.modeluuid"
          useType="modelRunResult"
          :resultSpiltObjects="resultSpiltObjects"
        />
    </div>
</template>
<script>
import {getAllRunTaskRel} from "@/api/analysis/auditmodelresult"
import childTabs from '@/views/analysis/auditmodelresult/childtabs'
export default {
    watch: {
    flag(value) {
      this.$nextTick(function() {
        if (value) {
          this.open = true
        }
      })
    }
  },
  created() {
    this.getQueryVariable();
  },
  components:{
      childTabs
  },
  data() {
    return {
      runTaskRelUuid: "",
      runTaskRel:{},
      mainTable:{},
      helpTables:[],
      modeluuid:'',
      resultSpiltObjects: {}, //存储点击结果拆分要传往后台的数据
      flag:false,
      open:false
    };
  },
  methods: {
    getQueryVariable() {
      this.helpTables = []
      this.runTaskRelUuid = this.$route.query.runTaskRelUuid
      getAllRunTaskRel().then(resp=>{
          var dataList = resp.data
          for(var i = 0;i<dataList.length;i++){
              if(dataList[i].runTaskRelUuid==this.runTaskRelUuid){
                 this.runTaskRel = dataList[i]
                 break
              }
          }
          var resultTables = this.runTaskRel.runResultTables
          this.modeluuid = this.runTaskRel.model.modelUuid
          for(var i = 0;i<resultTables.length;i++){
              if(resultTables[i].tableType==1){
                  this.mainTable = resultTables[i]
              }else if(resultTables[i].tableType==2){
                  this.helpTables.push(resultTables[i])
              }
          }
          this.flag = true
      })
    },
  },
};
</script>
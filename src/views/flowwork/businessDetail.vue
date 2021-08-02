<template>
    <div>
        <div >
<!--          // TODO 根据applyType，判断不同工作流，引用不同业务组件，例如：problemflow(问题复核)、clueflow(线索核实)、modelpublishflow(模型上线)-->

          <busDatas
                    ref="busDatas"
                    :versionUuid="versionUuid"
                    :appDataUuid="appDataUuid"
                    :applyType="applyType"
                    :flowSetup="flowSetup"
                    :actionIdList="actionIdList"
            ></busDatas>
        </div>
    </div>
</template>
<script>
    // TODO 引入待办业务组件
    import busDatas from "ams-clue-vue/src/components/todowork/busDatas";

    export default {
        components: {
            busDatas,
        },

        data() {
            return {
                // versionUuid: "",
                // appDataUuid: "",
                // applyType: "",
            };
        },
      /**
       * versionUuid: 流程图版本号，审批单版本号
       * appDataUuid: 业务数据主键
       * applyType:   审批单类型，工作流流程id
       * flowSetup:   工作流设置参数
       *               //控制审批页面元素显示隐藏参数
                         flowSet:{
                            opinionList:true,
                            opinion:true,
                            nextStep:true,     // 下一步
                            done:false    // 是否已办
                          },
       * actionIdList: 业务操作ID
       */
      props: ["versionUuid", "appDataUuid","applyType","flowSetup","actionIdList"],
        // mounted: function () {
        //   alert("ss")
        //   alert(this.appDataUuid)
        // },
        created(){
            console.log(this.applyType)
        },
        methods: {

            updateSave(){
                setTimeout(() => {
                    this.$refs["busDatas"].updateSave();
                }, 20);
            }
        }
    };
</script>
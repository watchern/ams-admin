<template>
    <div>
        <div >
            <busDatas
                    ref="busDatas"
                    :versionUuid="versionUuid"
                    :appDataUuid="appDataUuid"
                    :applyType="applyType"
                    :flowSetup="flowSetup"
            ></busDatas>
        </div>
    </div>
</template>
<script>
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
        props: ["versionUuid", "appDataUuid","applyType","flowSetup"],
        // mounted: function () {
        //   alert("ss")
        //   alert(this.appDataUuid)
        // },

        methods: {

            updateSave(){
                setTimeout(() => {
                    this.$refs["busDatas"].updateSave();
                }, 20);
            }
        }
    };
</script>
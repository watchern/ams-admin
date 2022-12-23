<template>
    <div>
        <div>
            11111111111111111111111111111
            {{versionUuid1}}
        </div>
    </div>
</template>
<script>

export default {

  props: ["versionUuid"],
    data() {
        return {
            versionUuid1: "12222222222",
        };
    },
  mounted: function() {
    // this.isEdit false 不可编辑   true 可编辑
    // 异步加载
    // alert(this.versionUuid)
    this.versionUuid1=this.versionUuid;
  },
}

</script>
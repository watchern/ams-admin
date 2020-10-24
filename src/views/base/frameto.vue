<template>
  <div>this is frame to</div>
  <iframe id="mainContentFrame" class="main-frame" :src="frameUrl" />
</template>

<script>
export default {
  data() {
    return {
    }
  },
  computed: {
    frameUrl: function() {
      return unescape(this.$route.fullPath.replace('/frameto?url=', ''))
    }
  }
}
</script>
<style scoped>
.main-frame{
  width: 100%;
  height: calc(100% - 5px);
  border: none;
}
</style>

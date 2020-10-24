<template>
  <div class="app-container">
    <iframe id="mainContentFrame" class="main-frame" :src="frameUrl" />
  </div>
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
  },
  created() {
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

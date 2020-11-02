
<template>
  <div class="main-layout-box">
    <m-file-resource />
    <!-- <router-view /> -->
  </div>
</template>
<script>
import mFileResource from './pages/file/pages/list/index'
export default {
  name: 'ResourceIndex',
  components: { mFileResource },
  mounted() {
    this.$modal.destroy()
  }
}
</script>

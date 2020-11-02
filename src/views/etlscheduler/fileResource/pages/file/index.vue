<template>
  <router-view />
</template>
<script>
export default {
  name: 'FileManageIndex',
  mounted() {
    this.$modal.destroy()
  }
}
</script>

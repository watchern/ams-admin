<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import url('assets/styles/css/index.css');
.el-loading-mask{
  z-index: 1998;
}
</style>

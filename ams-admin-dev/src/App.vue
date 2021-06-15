<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
@import url("styles/css/index.css");
.el-loading-mask {
  z-index: 1998;
}
</style>

<template>
  <div class="ace-home">
    <div>
      <el-button type="warning">
        <router-link to="/dashboard">原生页面</router-link>
      </el-button>
      <el-button type="primary">
        <router-link to="/ace">Ace页面</router-link>
      </el-button>
      <el-button type="primary">
        <router-link to="/ace/assembly">通用组件</router-link>
      </el-button>
    </div>
  </div>
</template>

<script>
export default {

}
</script>
<style lang="scss" scoped>
.ace-home{

}
</style>

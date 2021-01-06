<template>
  <div class="page-container">
<!--    <iframe src="http://139.159.246.94:1073/home/project" scrolling="no" frameborder="0" />-->
    <el-link :href="indexUrl" target="_blank">访问数据挖掘</el-link>
  </div>
</template>
<script>
export default {
  data() {
    return {
      indexUrl: '#'
    }
  },
  created() {
    this.indexUrl = process.env.VUE_APP_DATA_MINING_INDEX
    console.log(this.indexUrl)
  }
}
</script>

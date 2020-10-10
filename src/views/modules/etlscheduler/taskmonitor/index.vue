<template>
  <div class="app-container">
    <div>
      <el-button
        type="primary"
        size="mini"
        @click="handleProcess()"
      >查看流程实例监控</el-button>
      <el-button
        type="primary"
        size="mini"
        @click="handleSchedule()"
      >查看任务监控</el-button>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    handleProcess() {
      this.$router.push('/etlscheduler/processinstance')
    }
  }
}
</script>

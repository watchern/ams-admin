<template>
  <div class="page-container">
    <div>
      <el-button
        type="primary"
        @click="handleProcess()"
      >查看流程实例监控</el-button>
      <el-button
        type="primary"
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
    },
    handleSchedule() {
      this.$router.push('/etlscheduler/taskinstance')
    }
  }
}
</script>

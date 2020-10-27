<template>
  <div style="height:90vh;overflow-y:scroll;">
    <m-db />
  </div>
</template>
<script>
import mDb from '@/views/modules/etlscheduler/servermonitor/pages/servers/db'
export default {
  name: 'DbMonitor',
  components: { mDb },
  mounted() {
    this.$modal.destroy()
  }
}
</script>

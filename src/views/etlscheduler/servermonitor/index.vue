<template>
  <!-- <div class="main-layout-box">
    <m-secondary-menu :type="'monitor'" />
    <router-view />
  </div> -->
  <div style="height:90vh;overflow-y:scroll;">
    <m-master />
    <m-work />
    <m-zookeeper />
  </div>
</template>
<script>
import mMaster from './pages/servers/master'
import mWork from './pages/servers/worker'
import mZookeeper from './pages/servers/zookeeper'
export default {
  name: 'MonitorIndex',
  components: { mWork, mMaster, mZookeeper },
  mounted() {
    this.$modal.destroy()
  }
}
</script>

<template>
  <m-list-construction :title="'Zookeeper 管理'">
    <template slot="content">
      <template v-if="zookeeperList.length">
        <m-list :list="zookeeperList" />
      </template>
      <template v-if="!zookeeperList.length">
        <m-no-data />
      </template>
      <m-spin :is-spin="isLoading" />
    </template>
  </m-list-construction>
</template>
<script>
import { mapActions } from 'vuex'
import mList from './_source/zookeeperList'
import mSpin from '@/components/etl/spin/spin'
import mNoData from '@/components/etl/noData/noData'
import mListConstruction from '@/components/etl/listConstruction/listConstruction'

export default {
  name: 'ServersZookeeper',
  props: {},
  data() {
    return {
      isLoading: false,
      zookeeperList: []
    }
  },
  methods: {
    ...mapActions('monitor', ['getZookeeperData'])
  },
  watch: {},
  created() {
    this.isLoading = false
    this.getZookeeperData().then(res => {
      this.zookeeperList = res
      this.isLoading = false
    }).catch(() => {
      this.isLoading = false
    })
  },
  mounted() {

  },
  components: { mList, mListConstruction, mSpin, mNoData }
}
</script>
<style lang="scss" rel="stylesheet/scss">
  @import "./servers";
</style>

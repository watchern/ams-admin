<template>
  <div class="affirm-model">
    <m-popup
      ok-text="继续编辑"
      name-text="确定退出编辑工作流吗"
      @close="_close"
      @ok="_ok"
    />
  </div>
</template>
<script>
import mPopup from '@/components/etl/popup/popup'

export default {
  name: 'Affirm',
  components: { mPopup },
  methods: {
    _ok() {
      this.$emit('ok')
    },
    _close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  .affirm-model {
    .popup-model  {
      .top-p {
        height: 50px;
      }
      .content-p {
        min-height: 0px;
        min-width: 250px;
      }
    }
  }
</style>

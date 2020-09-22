<template>
  <div class="affirm-model">
    <m-popup
      ok-text="保存"
      name-text="是否保存DAG图"
      @close="_close"
      @ok="_ok"
    />
  </div>
</template>
<script>
import mPopup from '@/components/Dolphin/popup/popup'

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

<style lang="scss" rel="stylesheet/scss">
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

<template>
  <div class="home-main list-construction-model">
    <div class="content-title">
      <span>{{ title }}</span>
    </div>
    <div class="conditions-box">
      <slot name="conditions" />
    </div>
    <div class="list-box">
      <slot name="content" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'ListConstruction',
  props: {
    title: String
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.content-title {
      height: 0;
      border-radius: 3px 3px 0 0;
      span {
        font-size: 22px;
        padding-left: 18px;
        padding-top: 10px;
        display: inline-block;
        color: #2A455B;
      }
    }
</style>

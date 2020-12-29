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
